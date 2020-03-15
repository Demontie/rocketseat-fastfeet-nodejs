import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymenController from './app/controllers/DeliverymenController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliverymanFeaturesController from './app/controllers/DeliverymanFeaturesController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Tudo que vier depois irá ter uma validação
routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:recipientId', RecipientController.update);

routes.get('/deliverymen', DeliverymenController.index);
routes.post('/deliverymen', DeliverymenController.store);
routes.put('/deliverymen/:deliverymanId', DeliverymenController.update);
routes.delete('/deliverymen/:deliverymanId', DeliverymenController.delete);

routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:deliveryId', DeliveryController.update);
routes.delete('/deliveries/:deliveryId', DeliveryController.delete);

/* Deliveryman Features */
routes.get(
  '/deliveryman/:deliverymanId/deliveries',
  DeliverymanFeaturesController.index
);

routes.put(
  '/deliveryman/:deliverymanId/delivery/:deliveryId',
  DeliverymanFeaturesController.update
);

routes.post(
  '/deliveryman/:deliverymanId/delivery/:deliveryId',
  upload.single('file'),
  DeliverymanFeaturesController.store
);
/* Deliveryman Features END */

routes.get('/delivery/:deliveryId/problems', DeliveryProblemController.index);
routes.post('/delivery/:deliveryId/problems', DeliveryProblemController.store);
routes.delete(
  '/problem/:deliveryProblemId/cancel-delivery',
  DeliveryProblemController.delete
);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
