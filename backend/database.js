// Enhanced database with more fields
const db = {
  users: [
      { 
          id: 1, 
          email: "admin@chimshield.com", 
          password: "admin123", 
          role: "admin",
          name: "Admin User",
          phone: "+265 123 456 789"
      },
      { 
          id: 2, 
          email: "user@example.com", 
          password: "user123", 
          role: "user",
          name: "John Doe",
          phone: "+265 987 654 321"
      }
  ],
  teams: [
      { 
          id: 1, 
          name: "VIPs Services", 
          type: "vip", 
          location: "Lilongwe,Blantyre,Mzuzu", 
          price: 80000, 
          rating: 4.7,
          leader: "Aaron Majonga",
          members: ["John Matenda", "Alice Martin", "Bob Willimon"],
          description: "Specialized in VIP security services"
      },
      { 
          id: 2, 
          name: "Residential buildings", 
          type: "corporate", 
          location: "Lilongwe,Blantyre,Mzuzu", 
          price: 100000, 
          rating: 5.0,
          leader: "Simon Jari",
          members: ["Sarah Johnson", "Michael Brown"],
          description: "Residential security specialists"
      }
  ],
  bookings: [
      {
          id: 1,
          teamId: 1,
          userId: 2,
          eventType: "wedding",
          date: "2025-05-15",
          status: "confirmed",
          paymentStatus: "paid",
          amount: 80000,
          paymentDate: "2025-04-25"
      }
  ],
  messages: [],
  calls: [],
  payments: []
};

module.exports = db;