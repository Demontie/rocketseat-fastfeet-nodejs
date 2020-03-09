import * as Yup from 'yup';
import Deliverymen from '../models/Deliverymen';
import File from '../models/File';

class DeliverymanFeaturesController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveryman = await Deliverymen.findAll({
      offset: (page - 1) * 10,
      limit: 10,
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;
    const deliverymanExists = await Deliverymen.findOne({
      where: { email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already registered!' });
    }

    const { id, name } = await Deliverymen.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;
    const { deliverymanId } = req.params;

    const deliveryman = await Deliverymen.findByPk(deliverymanId);

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found.' });
    }

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliverymen.findOne({ where: { email } });
      if (deliverymanExists) {
        return res
          .status(400)
          .json({ error: 'Deliveryman already registered.' });
      }
    }

    const { name } = await deliveryman.update(req.body);

    return res.json({
      name,
      email,
    });
  }

  async delete(req, res) {
    const { deliverymanId } = req.params;

    const deliveryman = await Deliverymen.findByPk(deliverymanId);

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found.' });
    }

    await deliveryman.destroy();

    return res.json(deliveryman);
  }
}

export default new DeliverymanFeaturesController();
