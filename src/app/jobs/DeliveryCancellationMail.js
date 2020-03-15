import Mail from '../../lib/Mail';
import Delivery from '../models/Delivery';
import Deliverymen from '../models/Deliverymen';
import Recipient from '../models/Recipient';

class DeliveryCancellationMail {
  get key() {
    return 'DeliveryCancellationMail';
  }

  async handle({ data }) {
    const { delivery_id } = data;
    const delivery = await Delivery.findAll({
      where: { id: delivery_id },
      attributes: ['id', 'product'],
      include: [
        {
          model: Deliverymen,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
    });

    const { deliveryman, recipient } = delivery;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Delivery canceled',
      template: 'deliveryCancellation',
      context: {
        deliveryman: deliveryman.name,
        product: delivery.product,
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

export default new DeliveryCancellationMail();
