import { prisma } from '@/lib/prisma';
import { Prisma, PaymentMethod, OrderStatus } from '@prisma/client';
import { Faker, es, en } from '@faker-js/faker';
import { setProductStatus } from '@/features/products/utils';
import { createHash } from '@/features/users/utils';
import { getImgUnsplash, downloadImage } from '@/lib/imgUnsplash';
import testProduts from './testProducts.json';
import { uploadFileForSeeding } from '@/lib/cloudinary';
import { removeFile } from '@/features/products/utils';
import { resolve } from 'path';

const faker = new Faker({ locale: [es, en] }); //busca resultados en español, si no encuentra, busca en inglés

async function main() {
  // Crear Payments
  const payments = await Promise.all([
    prisma.payment.create({ data: { name: PaymentMethod.CASH } }),
    prisma.payment.create({ data: { name: PaymentMethod.CARD } }),
    prisma.payment.create({ data: { name: PaymentMethod.DIGITAL } }),
  ]);

  // Crear Discounts
  const discounts = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.discount.create({
        data: {
          rate: new Prisma.Decimal(
            faker.number.float({ min: 5, max: 30, fractionDigits: 0 })
          ),
        },
      })
    )
  );

  // Crear Stores
  const stores = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.store.create({
        data: {
          name: faker.company.name(),
          address: faker.location.streetAddress(),
          tel: faker.phone.number(),
        },
      })
    )
  );

  // Crear Users
  const users = await Promise.all(
    Array.from({ length: 5 }).map(async () =>
      prisma.user.create({
        data: {
          name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          password: await createHash(faker.internet.password()),
          birthdate: faker.date.birthdate(),
        },
      })
    )
  );

  //Crear el usuario para testear
  const password = process.env.TEST_USER_PASSWORD!;
  const email = process.env.TEST_USER_EMAIL!;

  const userTest = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Test',
      last_name: 'User',
      email,
      password: await createHash(password),
      birthdate: faker.date.birthdate(),
    },
  });

  //Relacionar el usuario test con una tienda
  const storeTest = faker.helpers.arrayElement(stores);
  await prisma.userStore.create({
    data: {
      userId: userTest.id,
      storeId: storeTest.id,
    },
  });

  // Relacionar el resto de los Users con Stores
  await Promise.all(
    users.map((user) => {
      const store = faker.helpers.arrayElement(
        stores.filter((s) => s.id !== storeTest.id)
      );
      return prisma.userStore.create({
        data: {
          userId: user.id,
          storeId: store.id,
        },
      });
    })
  );

  //Crear productos con imágenes para la tienda del user test
  const unsplash = process.env.UNSPLASH_API_KEY || '';
  const testProducts = await Promise.all(
    testProduts.map(async (p) => {
      const img = await getImgUnsplash(unsplash, p.name_en);
      let cloudinaryImgPath: string = '';
      let cloudinaryId: string = '';

      const filePath = await downloadImage(img, p.barcode);
      const absolutePath = resolve(filePath!);

      if (filePath) {
        const cloudinaryResult = await uploadFileForSeeding(
          absolutePath,
          'products_test'
        );
        cloudinaryImgPath = cloudinaryResult.secure_url;
        cloudinaryId = cloudinaryResult.public_id;
        removeFile(filePath);
      }
      const stock = p.stock;
      const stock_min = p.stock_min;
      const stock_optimus = p.stock_optimum;
      const status = setProductStatus(stock, stock_min, stock_optimus);
      return prisma.product.create({
        data: {
          name: p.name,
          barcode: p.barcode,
          salesPrice: p.salesPrice,
          costPrice: p.costPrice,
          description: p.description,
          imagePath: cloudinaryImgPath,
          cloudinary_id: cloudinaryId,
          stock,
          stock_min,
          stock_optimus,
          storeId: storeTest.id,
          status,
        },
      });
    })
  );

  // Crear Products
  const products = await Promise.all(
    Array.from({ length: 100 }).map(() => {
      const store = faker.helpers.arrayElement(
        stores.filter((s) => s.id !== storeTest.id)
      );
      const stock = faker.number.int({ min: 1, max: 200 });
      const stock_min = 10;
      const stock_optimus = 50;
      const status = setProductStatus(stock, stock_min, stock_optimus);

      return prisma.product.create({
        data: {
          barcode: faker.string.numeric(13),
          name: faker.food.ingredient(),
          description: faker.commerce.productDescription(),
          stock,
          stock_min,
          stock_optimus,
          costPrice: new Prisma.Decimal(
            faker.commerce.price({ min: 10, max: 10000 })
          ),
          salesPrice: new Prisma.Decimal(
            faker.commerce.price({ min: 50, max: 15000 })
          ),
          storeId: store.id,
          status,
          is_active: true,
        },
      });
    })
  );

  const totalProducts = products.concat(testProducts);

  // Crear Orders y OrderLines solo para la tienda del admin
  const orders = await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      // const store = faker.helpers.arrayElement(totalStores);
      const discount = faker.helpers.arrayElement(discounts);
      const payment = faker.helpers.arrayElement(payments);

      const order = await prisma.order.create({
        data: {
          storeId: storeTest.id,
          discountID: discount.id,
          paymentId: payment.id,
          subTotalAmount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(0),
          status: OrderStatus.PAID,
          createdAt: faker.date.between({from: '2024-01-01', to: new Date()})
        },
      });

      //Se verifica que no haya 2 duplas storeId-barcode iguales
      const usedProductBarcodes = new Set<string>();
      const numLines = faker.number.int({ min: 1, max: 5 });
      let subTotal = new Prisma.Decimal(0);
      for (let i = 0; i < numLines; i++) {
        let product: (typeof products)[number];
        let attempts = 0;

        do {
          product = faker.helpers.arrayElement(totalProducts);
          attempts++;
        } while (usedProductBarcodes.has(product.barcode) && attempts < 10);

        if (usedProductBarcodes.has(product.barcode)) break;
        usedProductBarcodes.add(product.barcode);

        const quantity = faker.number.int({ min: 1, max: 10 });
        const lineTotal = product.salesPrice.mul(quantity).toDecimalPlaces(2);
        subTotal = subTotal.add(lineTotal);

        await prisma.orderLines.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity,
            totalSalesPrice: lineTotal,
          },
        });
      }
      let totalAmount: Prisma.Decimal;
      if (discount) {
        const discountAmount = subTotal.mul(discount.rate.div(100));
        totalAmount = subTotal.sub(discountAmount);
      } else {
        totalAmount = subTotal;
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          subTotalAmount: subTotal,
          totalAmount,
        },
      });

      return order;
    })
  );

  console.log(
    `Seeded test user, ${users.length} users, ${stores.length} stores, ${products.length} products, ${orders.length} orders.`
  );
}

main()
  .then(async () => {
    console.log('✅ Datos insertados correctamente');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed', e);
    await prisma.$disconnect();
    process.exit(1);
  });
