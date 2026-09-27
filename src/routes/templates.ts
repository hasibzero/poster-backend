import { Router } from 'express';
import { 
  getTemplates, 
  getTemplateById, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate 
} from '../controllers/templateController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const templateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    occasionType: z.enum(['victory', 'condolence', 'campaign', 'greeting', 'eid']),
    thumbnailUrl: z.string().url(),
    layoutConfig: z.object({
      dimensions: z.object({
        width: z.number().default(1200),
        height: z.number().default(1600),
      }),
      photoSlots: z.array(z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        shape: z.enum(['rect', 'circle']).default('rect'),
        order: z.number().default(0),
      })),
      textSlots: z.array(z.object({
        key: z.string(),
        x: z.number(),
        y: z.number(),
        maxWidth: z.number(),
        fontSize: z.number(),
        fontFamily: z.string().default('Noto Sans Bengali'),
        color: z.string(),
        align: z.enum(['left', 'center', 'right']).default('center'),
        isBangla: z.boolean().default(true),
      })),
      backgroundConfig: z.object({
        type: z.enum(['color', 'image', 'pattern', 'gradient']),
        value: z.string(),
        opacity: z.number().default(1),
      }),
      decorativeElements: z.array(z.object({
        type: z.enum(['flag', 'border', 'motif', 'dove', 'rice-paddy', 'custom']),
        position: z.object({ x: z.number(), y: z.number() }),
        scale: z.number().default(1),
        rotation: z.number().default(0),
        opacity: z.number().default(1),
        src: z.string().optional(),
        color: z.string().optional(),
      })),
    }),
    isActive: z.boolean().default(true),
  }),
});

router.get('/', getTemplates);
router.get('/:id', getTemplateById);

// Admin only
router.post('/', authenticate, authorize('admin'), validate(templateSchema), createTemplate);
router.patch('/:id', authenticate, authorize('admin'), updateTemplate);
router.delete('/:id', authenticate, authorize('admin'), deleteTemplate);

export default router;
