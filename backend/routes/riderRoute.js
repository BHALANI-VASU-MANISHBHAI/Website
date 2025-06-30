import express from 'express';

import {  getAllRiders,
  assignRider,
  updateRiderLocation,
  updateRiderStatus,
  riderAcceptOrder,GetcurrentRiderOrder,riderAcceptedOrder,
  riderEarningByRange
} from '../controllers/RiderController.js';
import  restrictToRoles  from '../middleware/restrictToRole.js'
const riderRouter = express.Router();


riderRouter.get('/all', getAllRiders); 
riderRouter.get('/currentOrder', restrictToRoles("rider"), GetcurrentRiderOrder);
riderRouter.get('/acceptedOrder', restrictToRoles("rider"), riderAcceptedOrder); // Assuming this is for getting the accepted order by the rider
riderRouter.get('/earning', restrictToRoles("rider"), riderEarningByRange); // Assuming this is for getting the earnings of the rider
riderRouter.post('/assign', assignRider);
riderRouter.post('/acceptOrder', restrictToRoles("rider"), riderAcceptOrder);
riderRouter.put('/update-location', restrictToRoles("rider"), updateRiderLocation);
riderRouter.put('/update-riderStatus', restrictToRoles("rider"), updateRiderStatus);



export default riderRouter;