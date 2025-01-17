import { Router } from 'express';

const router = Router();

router.get('/public', async (_req, reply) => {
  return reply.json({ hello: 'world' });
});

router.get('/home', function (_req, res) {
  return res.render('home.ejs', {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  });
});

export const publicRoutes = router;
