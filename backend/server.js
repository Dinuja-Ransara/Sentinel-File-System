const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'Sentinel Security API', version: '5.0.0' });
});

let users = [
  { id: '1', name: 'T.M. Dinuja Ransara Abeywickrama', email: 'dinuja@sentinel.dev', plan: 'enterprise', company: 'Quantimite Corp', role: 'Chief Executive Officer' }
];

let documents = [
  { id: 'doc-1', userId: '1', fileName: 'Enterprise_Architecture_Blueprint_2026.pdf', contentType: 'application/pdf', fileSize: 4850000, uploadedAt: new Date().toISOString(), category: 'Engineering', sensitivity: 'Confidential' },
  { id: 'doc-2', userId: '1', fileName: 'Zero_Knowledge_Encryption_Spec.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 1420000, uploadedAt: new Date().toISOString(), category: 'Security', sensitivity: 'Restricted' },
  { id: 'doc-3', userId: '1', fileName: 'Q3_Financial_Projections.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileSize: 3200000, uploadedAt: new Date().toISOString(), category: 'Finance', sensitivity: 'Internal' }
];

let shareLinks = [
  { id: 'link-1', documentId: 'doc-1', fileName: 'Enterprise_Architecture_Blueprint_2026.pdf', token: 'sentinel_sec_enterprise_99x', expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(), createdAt: new Date().toISOString(), passwordProtected: true, downloads: 4 }
];

let auditLogs = [
  { id: 'act-1', userId: '1', action: 'AES-256 File Encryption & Threat Scan', target: 'Enterprise_Architecture_Blueprint_2026.pdf', timestamp: 'Just now', status: 'success', ip: '192.168.1.104' },
  { id: 'act-2', userId: '1', action: 'Generated secure expiring share token', target: 'Enterprise_Architecture_Blueprint_2026.pdf', timestamp: '1 hour ago', status: 'info', ip: '192.168.1.104' },
  { id: 'act-3', userId: '1', action: 'Biometric 2FA Hardware Key Verified', target: 'Authentication Session', timestamp: '3 hours ago', status: 'success', ip: '192.168.1.104' }
];

let teamMembers = [
  { id: 'tm-1', name: 'Zeinab Shereen', email: 'zeinab@sentinel.dev', role: 'Security Officer', status: 'Active' },
  { id: 'tm-2', name: 'Shehara Dagonna', email: 'shehara@sentinel.dev', role: 'Compliance Lead', status: 'Active' },
  { id: 'tm-3', name: 'Dileepa Fernando', email: 'dileepa@sentinel.dev', role: 'Vault Administrator', status: 'Pending' }
];

const upload = multer({ limits: { fileSize: 500 * 1024 * 1024 } });

app.post('/api/auth/login', async (req, res) => {
  const { email, company } = req.body;
  const user = users.find(u => u.email === email) || users[0];
  if (company) user.company = company;
  const token = jwt.sign({ userId: user.id, email: user.email }, 'secret', { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true });
  res.json({ success: true, user });
});

app.get('/api/documents', (req, res) => res.json(documents));
app.post('/api/documents/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const newDoc = {
    id: 'doc-' + Date.now(),
    userId: '1',
    fileName: req.file.originalname,
    contentType: req.file.mimetype,
    fileSize: req.file.size,
    uploadedAt: new Date().toISOString(),
    category: req.body.category || 'General',
    sensitivity: req.body.sensitivity || 'Confidential'
  };
  documents.unshift(newDoc);
  res.json({ success: true, document: newDoc });
});
app.delete('/api/documents/:id', (req, res) => {
  documents = documents.filter(d => d.id !== req.params.id);
  res.json({ success: true });
});
app.get('/api/share', (req, res) => res.json(shareLinks));
app.delete('/api/share/:id', (req, res) => {
  shareLinks = shareLinks.filter(l => l.id !== req.params.id);
  res.json({ success: true });
});
app.get('/api/activity', (req, res) => res.json(auditLogs));
app.get('/api/team', (req, res) => res.json(teamMembers));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
