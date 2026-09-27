import authRoutes from './auth';
import templateRoutes from './templates';
import posterRoutes from './posters';
import uploadRoutes from './upload';

const routes = (app: any) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/posters', posterRoutes);
  app.use('/api/upload', uploadRoutes);
  
  app.get('/', (req: any, res: any) => {
    res.json({ success: true, message: 'Poster API is running perfectly on Vercel!' });
  });

  app.get('/api/health', (req: any, res: any) => {
    res.json({ success: true, message: 'API is running' });
  });
};

export default routes;