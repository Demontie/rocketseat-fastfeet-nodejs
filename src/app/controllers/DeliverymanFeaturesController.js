import { Op } from 'sequelize';
import { startOfDay, endOfDay, getHours } from 'date-fns';
import Deliverymen from '../models/Deliverymen';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliverymanFeaturesController {
  async index(req, res) {
    const { deliverymanId } = req.params;
    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      where: { canceled_at: null, deliveryman_id: deliverymanId },
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

  /* Delivery order */

  async store(req, res) {
    const { deliverymanId, deliveryId } = req.params;

    const delivery = await Delivery.findOne({
      where: {
        deliveryman_id: deliverymanId,
        id: deliveryId,
        end_date: null,
        start_date: { [Op.not]: null },
      },
    });

    if (!delivery) {
      return res
        .status(400)
        .json({ error: 'There is no delivery for the deliveryman.' });
    }

    const { originalname: name, filename: path } = req.file;
    const { id } = await File.create({
      name,
      path,
    });

    await delivery.update({ signature_id: id, end_date: new Date() });

    return res.json(delivery);
  }

  /* Delivery pickup */
  async update(req, res) {
    const { deliverymanId, deliveryId } = req.params;

    const deliveryExists = await Delivery.findOne({
      where: {
        deliveryman_id: deliverymanId,
        id: deliveryId,
        start_date: null,
      },
    });

    if (!deliveryExists) {
      return res
        .status(400)
        .json({ error: 'There is no delivery for the deliveryman.' });
    }

    const currentHours = getHours(new Date());
    if (!(currentHours > 8 && currentHours < 18)) {
      return res.status(400).json({
        error: 'Withdrawals can only be made between 8 a.m and 6 p.m.',
      });
    }

    const delivery = await Delivery.findAll({
      where: {
        deliveryman_id: deliverymanId,
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
      },
    });

    if (delivery.length > 5) {
      return res.status(400).json({
        error: 'Exceeded the maximum limit of 5 withdrawals per day',
      });
    }

    const deliveryUpdate = await Delivery.update(
      { start_date: new Date() },
      { where: { id: deliveryId } }
    );

    return res.json(deliveryUpdate);
  }
}

export default new DeliverymanFeaturesController();
