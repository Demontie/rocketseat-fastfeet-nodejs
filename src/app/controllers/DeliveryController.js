import * as Yup from 'yup';
// import { startOfDay, endOfDay } from 'date-fns';
import Delivery from '../models/Delivery';
import Deliverymen from '../models/Deliverymen';
import File from '../models/File';
import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import DeliveryAvailable from '../jobs/DeliveryAvailableMail';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveries = await Delivery.findAll({
      where: { canceled_at: null },
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'product'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
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

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exist.' });
    }

    const deliveryman = await Deliverymen.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist.' });
    }

    const { id } = await Delivery.create({
      product,
      recipient_id,
      deliveryman_id,
    });

    await Queue.add(DeliveryAvailable.key, {
      product,
      deliveryman,
      recipient,
    });

    return res.json({ id, product, recipient_id, deliveryman_id });
  }

  async update(req, res) {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findByPk(deliveryId);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery not found.' });
    }

    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    if (recipient_id && recipient_id !== delivery.recipient_id) {
      const recipient = await Recipient.findByPk(recipient_id);

      if (!recipient) {
        return res.status(400).json({ error: 'Recipient does not exist.' });
      }
    }
    if (deliveryman_id && deliveryman_id !== delivery.deliveryman_id) {
      const deliverymen = await Deliverymen.findByPk(deliveryman_id);

      if (!deliverymen) {
        return res.status(400).json({ error: 'Deliveryman does not exist.' });
      }
    }

    const { id } = await delivery.update({
      product,
      recipient_id,
      deliveryman_id,
    });

    return res.json({ id, product, recipient_id, deliveryman_id });
  }

  async delete(req, res) {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findByPk(deliveryId);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery not found.' });
    }

    await delivery.destroy();

    return res.json(delivery);
  }
}

export default new DeliveryController();
