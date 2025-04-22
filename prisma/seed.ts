import { prisma } from '@/lib/prisma';
import { Prisma, PaymentMethod, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { setProductStatus } from '@/features/products/utils';
import { createHash } from '@/features/users/utils';

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
          rate: new Prisma.Decimal(faker.number.float({ min: 5, max: 30 })),
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

  // Crear Products
  const products = await Promise.all(
    Array.from({ length: 100 }).map(() => {
      const store = faker.helpers.arrayElement(stores);
      const stock = faker.number.int({ min: 1, max: 200 });
      const stock_min = 10;
      const stock_optimus = 50;
      const status = setProductStatus(stock, stock_min, stock_optimus);

      return prisma.product.create({
        data: {
          barcode: faker.string.numeric(13),
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          stock,
          stock_min,
          stock_optimus,
          costPrice: new Prisma.Decimal(
            faker.commerce.price({ min: 10, max: 20000 })
          ),
          salesPrice: new Prisma.Decimal(
            faker.commerce.price({ min: 50, max: 40000 })
          ),
          storeId: store.id,
          status,
          is_active: true,
        },
      });
    })
  );

  // Seed Orders y OrderLines
  const orders = await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      const store = faker.helpers.arrayElement(stores);
      const discount = faker.helpers.maybe(() =>
        faker.helpers.arrayElement(discounts)
      );
      const payment = faker.helpers.maybe(() =>
        faker.helpers.arrayElement(payments)
      );

      const order = await prisma.order.create({
        data: {
          storeId: store.id,
          discountID: discount?.id,
          paymentId: payment?.id,
          subTotalAmount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(0),
          status: OrderStatus.PAID,
        },
      });

      const usedProductIds = new Set<string>();
      const numLines = faker.number.int({ min: 1, max: 5 });
      let subTotal = new Prisma.Decimal(0);
      let orderItems = []; //era para usar en la generación de PDFs pero lo descarté
      for (let i = 0; i < numLines; i++) {
        let product: (typeof products)[number];
        let attempts = 0;

        do {
          product = faker.helpers.arrayElement(products);
          attempts++;
        } while (usedProductIds.has(product.id) && attempts < 10);

        if (usedProductIds.has(product.id)) break;

        usedProductIds.add(product.id);
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
        orderItems.push({
          productId: product.id,
          name: product.name,
          quantity,
          salesPrice: Number(product.salesPrice),
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
