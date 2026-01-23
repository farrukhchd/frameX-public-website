export default class OrderRequest {
  constructor({
    name,
    phone,
    address,
    city,
    paymentType = "COD",
    deadline = null,
    socialHandle = null,
    advance = 0,
    sendSMS = true,
    items = [],
    total = 0,
    deliveryCharges = 0,
    orderType = "normal",
    notes = "",
  }) {
    this.name = name;
    this.phone = phone;
    this.address = address;
    this.city = city;
    this.paymentType = paymentType;
    this.deadline = deadline;
    this.socialHandle = socialHandle;
    this.advance = advance;
    this.sendSMS = sendSMS;
    this.items = items;
    this.total = total;
    this.deliveryCharges = deliveryCharges;
    this.orderType = orderType;
    this.notes = notes;
  }

  toJson() {
    return {
      customer: {
        name: this.name,
        phone: this.phone,
        address: this.address,
        city: this.city,
        paymentType: this.paymentType,
        deadline: this.deadline,
        socialHandle: this.socialHandle,
      },
      advance: this.advance,
      sendSMS: this.sendSMS,
      paymentType: this.paymentType,
      items: (this.items || []).map((i) => (typeof i.toJson === "function" ? i.toJson() : i)),
      total: this.total,
      createdAt: new Date().toISOString(),
      deliveryCharges: this.deliveryCharges,
      orderType: this.orderType,
      notes: this.notes,
    };
  }
}
