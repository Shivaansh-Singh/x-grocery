import { PrismaClient, Role, UnitType, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Store X database seed...");

  // 1. Seed Store X
  const storeX = await prisma.store.upsert({
    where: { slug: "store-x" },
    update: {},
    create: {
      name: "Store X (VIT Bhopal Off-Campus Hub)",
      slug: "store-x",
      address: "Kotri Kalan, Near VIT Bhopal Campus Road, Bhopal, MP",
      phone: "+91 98765 00000",
      isActive: true,
    },
  });
  console.log(`✓ Store X created: ${storeX.name} (${storeX.id})`);

  // 2. Seed Users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@x-grocery.com" },
    update: {},
    create: {
      email: "admin@x-grocery.com",
      name: "Store Owner X",
      phone: "+91 98765 43210",
      role: Role.STORE_ADMIN,
    },
  });

  const delivery1 = await prisma.user.upsert({
    where: { email: "delivery1@x-grocery.com" },
    update: {},
    create: {
      email: "delivery1@x-grocery.com",
      name: "Ramesh Kumar (Rider 1)",
      phone: "+91 98123 45678",
      role: Role.DELIVERY_PARTNER,
    },
  });

  const delivery2 = await prisma.user.upsert({
    where: { email: "delivery2@x-grocery.com" },
    update: {},
    create: {
      email: "delivery2@x-grocery.com",
      name: "Suresh Singh (Rider 2)",
      phone: "+91 98234 56789",
      role: Role.DELIVERY_PARTNER,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "student@vitbhopal.ac.in" },
    update: {},
    create: {
      email: "student@vitbhopal.ac.in",
      name: "Aarav Sharma",
      phone: "+91 99999 88888",
      role: Role.CUSTOMER,
      addresses: {
        create: {
          buildingColony: "Royal City Flats, Block B",
          flatRoomNo: "Flat 204",
          landmark: "Near VIT Bhopal Main Gate Road",
          phone: "+91 99999 88888",
          isDefault: true,
        },
      },
    },
  });

  console.log(`✓ Seeded users: Admin (${adminUser.email}), 2 Delivery Partners, 1 Customer`);

  // 3. Seed Categories
  const categoriesData = [
    { name: "Fresh Produce", slug: "fresh-produce", icon: "carrot", sortOrder: 1 },
    { name: "Dairy & Eggs", slug: "dairy-eggs", icon: "milk", sortOrder: 2 },
    { name: "Snacks & Munchies", slug: "snacks-munchies", icon: "cookie", sortOrder: 3 },
    { name: "Instant Noodles & Ready Meals", slug: "instant-food", icon: "utensils", sortOrder: 4 },
    { name: "Beverages & Drinks", slug: "beverages-drinks", icon: "cup-soda", sortOrder: 5 },
    { name: "Hostel Essentials", slug: "hostel-essentials", icon: "package", sortOrder: 6 },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: {
        storeId_slug: {
          storeId: storeX.id,
          slug: cat.slug,
        },
      },
      update: {},
      create: {
        storeId: storeX.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`✓ Seeded ${categoriesData.length} categories for Store X`);

  // 4. Seed Products
  const productsData = [
    {
      name: "Maggi 2-Min Masala Instant Noodles",
      slug: "maggi-masala-noodles-4pack",
      categorySlug: "instant-food",
      price: 56.0,
      unitType: UnitType.PACK,
      unitQuantity: 4,
      unitDisplay: "4 Pack (280g)",
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&q=80",
      description: "India's favorite instant masala noodles. Quick 2-minute snack for late-night study sessions.",
    },
    {
      name: "Amul Taaza Toned Milk",
      slug: "amul-taaza-toned-milk-500ml",
      categorySlug: "dairy-eggs",
      price: 27.0,
      unitType: UnitType.ML,
      unitQuantity: 500,
      unitDisplay: "500 ml Pouch",
      stock: 35,
      imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80",
      description: "Pasteurised toned milk from Amul. Fresh and nutritious.",
    },
    {
      name: "Lay's India's Magic Masala Potato Chips",
      slug: "lays-magic-masala-chips-50g",
      categorySlug: "snacks-munchies",
      price: 20.0,
      unitType: UnitType.GRAM,
      unitQuantity: 50,
      unitDisplay: "50g Pack",
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
      description: "Crispy ridge-cut potato chips packed with spicy Indian masala flavor.",
    },
    {
      name: "Fresh Robusta Bananas",
      slug: "fresh-robusta-bananas-1dozen",
      categorySlug: "fresh-produce",
      price: 60.0,
      unitType: UnitType.PIECE,
      unitQuantity: 12,
      unitDisplay: "1 Dozen (12 Pcs)",
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&q=80",
      description: "Freshly sourced sweet Robusta bananas, rich in potassium and energy.",
    },
    {
      name: "Bisleri Mineral Packaged Water",
      slug: "bisleri-water-bottle-1liter",
      categorySlug: "beverages-drinks",
      price: 20.0,
      unitType: UnitType.LITER,
      unitQuantity: 1,
      unitDisplay: "1 Liter Bottle",
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&q=80",
      description: "Safe and hygienic mineral water bottle with added minerals.",
    },
    {
      name: "Farm Fresh White Eggs",
      slug: "farm-fresh-white-eggs-6pack",
      categorySlug: "dairy-eggs",
      price: 48.0,
      unitType: UnitType.PACK,
      unitQuantity: 6,
      unitDisplay: "6 Eggs Pack",
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&q=80",
      description: "Clean, protein-packed fresh farm white eggs.",
    },
    {
      name: "Kurkure Masala Munch Crunchy Snack",
      slug: "kurkure-masala-munch-90g",
      categorySlug: "snacks-munchies",
      price: 20.0,
      unitType: UnitType.GRAM,
      unitQuantity: 90,
      unitDisplay: "90g Pack",
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=500&q=80",
      description: "Tedhe-medhe crunchy corn snack spiced with authentic spices.",
    },
    {
      name: "Coca-Cola Soft Drink Can",
      slug: "coca-cola-can-300ml",
      categorySlug: "beverages-drinks",
      price: 40.0,
      unitType: UnitType.ML,
      unitQuantity: 300,
      unitDisplay: "300 ml Can",
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
      description: "Refreshing sparkling cola drink to chill with friends.",
    },
    {
      name: "Amul Pasteurised Butter",
      slug: "amul-butter-100g",
      categorySlug: "dairy-eggs",
      price: 58.0,
      unitType: UnitType.GRAM,
      unitQuantity: 100,
      unitDisplay: "100g Pack",
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80",
      description: "Utterly butterly delicious Amul salted butter.",
    },
    {
      name: "Britannia Daily Fresh White Bread",
      slug: "britannia-white-bread-400g",
      categorySlug: "dairy-eggs",
      price: 45.0,
      unitType: UnitType.GRAM,
      unitQuantity: 400,
      unitDisplay: "400g Loaf",
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80",
      description: "Soft and fresh sandwich white bread loaf.",
    },
    {
      name: "Red Bull Energy Drink Can",
      slug: "red-bull-energy-drink-250ml",
      categorySlug: "beverages-drinks",
      price: 125.0,
      unitType: UnitType.ML,
      unitQuantity: 250,
      unitDisplay: "250 ml Can",
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500&q=80",
      description: "Vitalizes body and mind for intense study or project nights.",
    },
    {
      name: "Cadbury Dairy Milk Silk Chocolate",
      slug: "cadbury-dairy-milk-silk-60g",
      categorySlug: "snacks-munchies",
      price: 80.0,
      unitType: UnitType.GRAM,
      unitQuantity: 60,
      unitDisplay: "60g Bar",
      stock: 30,
      imageUrl: "/images/products/cadbury-silk.svg",
      description: "Rich, smooth, and creamy milk chocolate bar.",
    },
    {
      name: "Real Fruit Power Mixed Fruit Juice",
      slug: "real-mixed-fruit-juice-1liter",
      categorySlug: "beverages-drinks",
      price: 110.0,
      unitType: UnitType.LITER,
      unitQuantity: 1,
      unitDisplay: "1 Liter Pack",
      stock: 18,
      imageUrl: "/images/products/real-juice.svg",
      description: "Delicious blend of 9 fruit juices rich in natural Vitamin C.",
    },
    {
      name: "Surf Excel Easy Wash Detergent Powder",
      slug: "surf-excel-easy-wash-500g",
      categorySlug: "hostel-essentials",
      price: 65.0,
      unitType: UnitType.GRAM,
      unitQuantity: 500,
      unitDisplay: "500g Pack",
      stock: 25,
      imageUrl: "/images/products/surf-excel.svg",
      description: "Superior stain removal powder ideal for hostel bucket washing.",
    },
    {
      name: "Dettol Original Bathing Soap Bar",
      slug: "dettol-original-soap-75g",
      categorySlug: "hostel-essentials",
      price: 36.0,
      unitType: UnitType.GRAM,
      unitQuantity: 75,
      unitDisplay: "75g Soap Bar",
      stock: 30,
      imageUrl: "/images/products/dettol-soap.svg",
      description: "Trusted germ protection bathing soap for daily hygiene.",
    },
  ];

  for (const prod of productsData) {
    const categoryId = categoryMap[prod.categorySlug];
    if (!categoryId) continue;

    const createdProduct = await prisma.product.upsert({
      where: {
        storeId_slug: {
          storeId: storeX.id,
          slug: prod.slug,
        },
      },
      update: {
        stock: prod.stock,
        price: prod.price,
        imageUrl: prod.imageUrl,
      },
      create: {
        storeId: storeX.id,
        categoryId: categoryId,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        imageUrl: prod.imageUrl,
        unitType: prod.unitType,
        unitQuantity: prod.unitQuantity,
        unitDisplay: prod.unitDisplay,
        stock: prod.stock,
        isActive: true,
      },
    });

    // Create initial inventory log entry
    await prisma.inventoryLog.create({
      data: {
        productId: createdProduct.id,
        previousStock: 0,
        newStock: prod.stock,
        changeQuantity: prod.stock,
        reason: "INITIAL_SEED",
        updatedById: adminUser.id,
      },
    });
  }

  console.log(`✓ Seeded ${productsData.length} products with initial stock & inventory logs`);

  // 5. Seed Test Active Delivery Order for Ramesh Kumar (Rider 1)
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber: "XG-100101" },
  });

  if (!existingOrder) {
    const sampleProduct1 = await prisma.product.findFirst({
      where: { slug: "maggi-masala-noodles-4pack" },
    });
    const sampleProduct2 = await prisma.product.findFirst({
      where: { slug: "amul-taaza-toned-milk-500ml" },
    });
    const sampleProduct3 = await prisma.product.findFirst({
      where: { slug: "lays-magic-masala-chips-50g" },
    });

    if (sampleProduct1 && sampleProduct2 && sampleProduct3) {
      await prisma.order.create({
        data: {
          orderNumber: "XG-100101",
          storeId: storeX.id,
          customerId: customerUser.id,
          deliveryPartnerId: delivery1.id,
          status: OrderStatus.ASSIGNED,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          totalAmount: 199.0,
          deliveryAddress: "Royal City Flats, Block B, Flat 204, Near VIT Bhopal Main Gate Road. Phone: +91 99999 88888",
          items: {
            create: [
              {
                productId: sampleProduct1.id,
                productName: sampleProduct1.name,
                unitPrice: sampleProduct1.price,
                quantity: 2,
                subtotal: sampleProduct1.price * 2,
              },
              {
                productId: sampleProduct2.id,
                productName: sampleProduct2.name,
                unitPrice: sampleProduct2.price,
                quantity: 1,
                subtotal: sampleProduct2.price * 1,
              },
              {
                productId: sampleProduct3.id,
                productName: sampleProduct3.name,
                unitPrice: sampleProduct3.price,
                quantity: 3,
                subtotal: sampleProduct3.price * 3,
              },
            ],
          },
        },
      });
      console.log("✓ Seeded active delivery order #XG-100101 assigned to Ramesh Kumar (Rider 1)");
    }
  }

  console.log("🎉 Store X Database seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
