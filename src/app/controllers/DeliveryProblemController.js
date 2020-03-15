import * as Yup from 'yup';

import DeliveryProblem from '../schemas/DeliveryProblem';
import Delivery from '../models/Delivery';
import Queue from '../../lib/Queue';
import DeliveryCancellationMail from '../jobs/DeliveryCancellationMail';

class DeliveryProblemController {
  async index(req, res) {
    const { deliveryId } = req.params;

    const deliveryProblem = await DeliveryProblem.find({
      delivery_id: deliveryId,
    })
      .sort({ createAt: 'desc' })
      .limit(20);

    return res.json(deliveryProblem);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { delivery_id } = req.params;
    const { description } = req.body;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exist.' });
    }

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { deliveryProblemId } = req.params;

    const deliveryProblem = await DeliveryProblem.findById(deliveryProblemId);

    if (!deliveryProblem) {
      return res
        .status(400)
        .json({ error: 'Delivery problem does not exist.' });
    }

    const delivery = await Delivery.findByPk(deliveryProblem.delivery_id);
    delivery.canceled_at = new Date();
    await delivery.save();

    await Queue.add(DeliveryCancellationMail.key, delivery);

    return res.json(deliveryProblem);
  }
}

export default new DeliveryProblemController();
