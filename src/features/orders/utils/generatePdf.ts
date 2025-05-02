import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface Item {
  productId: string;
  name: string;
  quantity: number;
  salesPrice: number;
}

// Función auxiliar para dibujar la cabecera de la tabla
function drawTableHeader(
  doc: PDFKit.PDFDocument,
  y: number,
  startX: number,
  wArt: number,
  wQty: number,
  wPrice: number,
  wTotal: number
): number {
  doc
    .fontSize(12)
    .text('Artículo', startX, y, { width: wArt })
    .text('Cantidad', startX + wArt, y, { width: wQty, align: 'right' })
    .text('Precio', startX + wArt + wQty, y, { width: wPrice, align: 'right' })
    .text('Total', startX + wArt + wQty + wPrice, y, {
      width: wTotal,
      align: 'right',
    });

  y += 20;
  doc
    .moveTo(startX, y)
    .lineTo(startX + wArt + wQty + wPrice + wTotal, y)
    .stroke();

  return y + 10;
}

export default function generatePdf(
  date: string,
  storeName: string,
  items: Item[],
  subtotal: number,
  discount: number,
  total: number
) {
  const fontPath = path.join(process.cwd(), 'src', 'assets', 'fonts', 'Montserrat-Regular.ttf');

  const doc = new PDFDocument({ margin: 50, font: fontPath });

  const uploadDir = path.join(process.cwd(), 'public', 'temp');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, `${Date.now()}.pdf`);
  doc.pipe(fs.createWriteStream(filePath));
  doc.font(fontPath);

  // --- Encabezado ---
  doc.fontSize(24).text(storeName.trim().toUpperCase(), { align: 'right' });
  doc.moveDown().fontSize(20).text('COMPROBANTE DE PAGO');
  doc.moveDown().fontSize(12).text(`Fecha y hora: ${date}`);
  doc.moveDown(2);

  // --- Tabla de items ---
  const startX = 50;
  const colWidths = [200, 80, 80, 80];
  const [wArt, wQty, wPrice, wTotal] = colWidths;
  let y = doc.y;

  y = drawTableHeader(doc, y, startX, wArt, wQty, wPrice, wTotal);

  const rowHeight = 20;
  const bottomMargin = doc.page.margins.bottom;

  items.forEach((item) => {
    // Si no hay espacio para una fila más el resumen, agregar página
    if (y + rowHeight > doc.page.height - bottomMargin - 100) {
      doc.addPage();
      y = doc.y;
      y = drawTableHeader(doc, y, startX, wArt, wQty, wPrice, wTotal);
    }

    const totalItem = item.quantity * item.salesPrice;
    doc
      .text(item.name, startX, y, { width: wArt })
      .text(item.quantity.toString(), startX + wArt, y, {
        width: wQty,
        align: 'right',
      })
      .text(`$${item.salesPrice}`, startX + wArt + wQty, y, {
        width: wPrice,
        align: 'right',
      })
      .text(`$${totalItem}`, startX + wArt + wQty + wPrice, y, {
        width: wTotal,
        align: 'right',
      });

    y += rowHeight;
  });

  // Línea de cierre de tabla
  doc
    .moveTo(startX, y)
    .lineTo(startX + wArt + wQty + wPrice + wTotal, y)
    .stroke();

  doc.y = y + 20;

  // --- Resumen de totales ---
  const labelX = startX + wArt + wQty;
  const valueX = labelX + wPrice + 10;
  let summaryY = doc.y;

  const discountAmount = Math.round((subtotal * discount) / 100);

  doc
    .fontSize(12)
    .text('Subtotal:', labelX, summaryY, { width: wPrice, align: 'right' })
    .text(`$${subtotal}`, valueX, summaryY, { width: wTotal, align: 'right' });

  summaryY += 18;
  doc
    .text(`Descuento (${discount}%)`, labelX, summaryY, {
      width: wPrice,
      align: 'right',
    })
    .text(`$${discountAmount}`, valueX, summaryY, {
      width: wTotal,
      align: 'right',
    });

  summaryY += 26;
  doc
    .fontSize(14)
    .text('Total:', labelX, summaryY, { width: wPrice, align: 'right' })
    .text(`$${total}`, valueX, summaryY, { width: wTotal, align: 'right' });

  // --- Mensaje final centrado ---
  doc.moveDown(4);
  const pageWidth = doc.page.width;
  doc.fontSize(14).text('¡Gracias por su compra!', 0, doc.y, {
    width: pageWidth - 100,
    align: 'center',
  });

  doc.end();

  return filePath;
}
