import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import express from 'express';

const app = express();
const prismaClient = new PrismaClient();

app.listen(3000, () => {
  console.log("rodando rodando!!")
})

const BASE_SIZE = 1000

async function generateCompany() {
  console.log('Gerando empresas')
  for (let i = 0; i < BASE_SIZE; i++) {
    const company = await prismaClient.company.create({
      data: {
        idtCompany: randomUUID(),
        docCnpj: "1" + i + 1 + "00000" + i,
        namName: faker.company.name.name + i,
      }
    })

    await generateProduct(company.idtCompany)
  }

  console.log('Finalizou empresas')
}

async function generateProduct(companyId: string) {
  console.log('Gerando produtos')
  let products = []
  for (let i = 0; i < BASE_SIZE * 10; i++) {
    const product = await prismaClient.product.create({
      data: {
        idtProduct: randomUUID(),
        idtCompany: companyId,
        numMinimumQuantity: Math.floor(Math.random() * (1000 - 0) + 0),
        numQuantity: Math.floor(Math.random() * (1000 - 0) + 0),
        numPrice: faker.number.float({ min: 10, max: 100, precision: 0.1 }),
        namName: faker.commerce.product.name + i,
      }
    })

    products.push(product)
  }

  console.log('Finalizou produtos')
  await generateOrder(companyId, products)
}

async function generateOrder(companyId: string, products: any) {
  console.log('Gerando pedidos')

  const paymentType = ["CREDIT_CARD", "PIX", "DEBIT_CARD", "MONEY"]
  const status = ["PENDING", "COMPLETED", "CANCELED", "RETURNED"]

  for (let i = 0; i < BASE_SIZE * 100; i++) {
    const order = await prismaClient.order.create({
      data: {
        idtOrder: randomUUID(),
        idtCompany: companyId,
        indPaymentType: paymentType[Math.floor(Math.random() * (3 - 0) + 0)],
        indStatus: status[Math.floor(Math.random() * (3 - 0) + 0)],
      }
    })

    products = products.slice(Math.floor(Math.random() * (10 - 0) + 0), Math.floor(Math.random() * (1000 - 10) + 10))
    console.log('Finalizou pedidos')
    generateOrderProduct(order.idtOrder, products)
  }
}

async function generateOrderProduct(orderId: string, products: any) {
  console.log('Gerando itens dos pedidos')

  for (let i = 0; i < products.length; i++) {

    const bool = Math.floor(Math.random() * (1 - 0) + 0)

    await prismaClient.orderProduct.create({
      data: {
        idtOrderProduct: randomUUID(),
        idtOrder: orderId,
        idtProduct: products[i].idtProduct,
        numPrice: bool ? products[i].numPrice : products[i].numPrice - (products[i].numPrice / 100) * Math.floor(Math.random() * (10 - 0) + 0),
        numQuantity: Math.floor(Math.random() * (parseInt(products[i].numQuantity) - 0) + 0)
      }
    })
  }

  console.log('Finalizou itens dos pedidos')
}

generateCompany()