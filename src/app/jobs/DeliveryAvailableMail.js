import Mail from '../../lib/Mail';

class DeliveryAvailableMail {
  get key() {
    return 'DeliveryAvailableMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Delivery available',
      template: 'deliveryAvailable',
      context: {
        deliveryman: deliveryman.name,
        product,
        name: recipient.name,
        street: recipient.street,
        number: recipient.number,
        complement: recipient.complement || '',
        state: recipient.state,
        city: recipient.city,
        zipCode: recipient.zipCode,
      },
    });
  }
}

export default new DeliveryAvailableMail();
