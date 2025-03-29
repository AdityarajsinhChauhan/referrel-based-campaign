db = db.getSiblingDB('referral_system');

db.customers.insertMany([
  {
    businessId: ObjectId("67e53405bfd74315af064402"),
    email: "john.doe@example.com",
    name: "John Doe",
    phone: "+1234567890",
    source: "manual",
    status: "active",
    metadata: { location: "New York", interests: "Technology" },
    lastInteraction: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    businessId: ObjectId("67e53405bfd74315af064402"),
    email: "jane.smith@example.com",
    name: "Jane Smith",
    phone: "+1987654321",
    source: "manual",
    status: "active",
    metadata: { location: "San Francisco", interests: "Marketing" },
    lastInteraction: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    businessId: ObjectId("67e53405bfd74315af064402"),
    email: "mike.wilson@example.com",
    name: "Mike Wilson",
    phone: "+1122334455",
    source: "manual",
    status: "active",
    metadata: { location: "Chicago", interests: "Sales" },
    lastInteraction: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    businessId: ObjectId("67e53405bfd74315af064402"),
    email: "sarah.brown@example.com",
    name: "Sarah Brown",
    phone: "+1555666777",
    source: "manual",
    status: "active",
    metadata: { location: "Los Angeles", interests: "E-commerce" },
    lastInteraction: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    businessId: ObjectId("67e53405bfd74315af064402"),
    email: "david.miller@example.com",
    name: "David Miller",
    phone: "+1999888777",
    source: "manual",
    status: "active",
    metadata: { location: "Boston", interests: "Retail" },
    lastInteraction: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]); 