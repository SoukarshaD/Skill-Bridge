import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import {
  getMyCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  addToPortfolio,
  submitForVerification,
  getPendingCertificates,
  verifyCertificate,
  rejectCertificate,
  getCertificateAnalytics,
} from './certificates.controller';

const router = Router();

// ─── Student routes ────────────────────────────────────────────────────────
router.get('/my', requireAuth, requireRole(['STUDENT']), getMyCertificates);
router.post('/', requireAuth, requireRole(['STUDENT']), createCertificate);
router.patch('/:id', requireAuth, requireRole(['STUDENT']), updateCertificate);
router.delete('/:id', requireAuth, requireRole(['STUDENT']), deleteCertificate);
router.post('/:id/portfolio', requireAuth, requireRole(['STUDENT']), addToPortfolio);
router.post('/:id/submit', requireAuth, requireRole(['STUDENT']), submitForVerification);

// ─── Admin / Verifier routes ───────────────────────────────────────────────
router.get('/admin/pending', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), getPendingCertificates);
router.patch('/:id/verify', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), verifyCertificate);
router.patch('/:id/reject', requireAuth, requireRole(['ADMIN', 'INDUSTRY']), rejectCertificate);
router.get('/admin/analytics', requireAuth, requireRole(['ADMIN']), getCertificateAnalytics);

// ─── Shared read ──────────────────────────────────────────────────────────
router.get('/:id', requireAuth, getCertificate);

export const certificatesRouter = router;
