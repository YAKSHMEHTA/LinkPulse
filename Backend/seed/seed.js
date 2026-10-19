

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/usermodel.js';
import Campaign from '../models/Campaign.js';
import Link from '../models/link.js';
import ClickEvent from '../models/ClickEvent.js';
import Blocklist from '../models/blockList.js';

const isProd = process.env.isProd === 'true' || process.env.NODE_ENV === 'production';
if (isProd && !process.env.ALLOW_SEED) {
  console.error('Refusing to seed in production. Set ALLOW_SEED=1 to override.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://127.0.0.1:27017/linkpulse');


const DAY = 86400000;
const rnd = (n) => Math.floor(Math.random() * n);
const pickWeighted = (items) => {
  const total = items.reduce((s, i) => s + i[1], 0);
  let r = Math.random() * total;
  for (const [v, w] of items) if ((r -= w) <= 0) return v;
  return items[0][0];
};

const DEVICES = [['mobile', 55], ['desktop', 38], ['tablet', 7]];
const BROWSERS = [['Chrome', 50], ['Safari', 28], ['Firefox', 8], ['Edge', 10], ['Samsung Browser', 4]];
const OS = { mobile: [['Android', 60], ['iOS', 40]], tablet: [['iOS', 70], ['Android', 30]], desktop: [['Windows', 55], ['macOS', 30], ['Linux', 15]] };
const REFERRERS = [['direct', 30], ['linkedin.com', 20], ['t.co', 15], ['instagram.com', 12], ['google.com', 12], ['whatsapp.com', 7], ['qr-code', 4]];
const GEO = [['IN', 'Delhi', 40], ['US', 'New York', 20], ['GB', 'London', 10], ['DE', 'Berlin', 8], ['SG', 'Singapore', 8], ['AE', 'Dubai', 6], [null, null, 8]];

function makeClicks({ link, count, fromDay, toDay, pool }) {
  const docs = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = fromDay + Math.floor(Math.pow(Math.random(), 1.3) * (toDay - fromDay + 1));
    const ts = new Date(Date.now() - daysAgo * DAY - rnd(DAY));
    const isBot = Math.random() < 0.08;
    const device = isBot ? 'desktop' : pickWeighted(DEVICES);
    const g = pickWeighted(GEO.map(([c, city, w]) => [[c, city], w]));
    docs.push({
      linkId: link._id,
      ownerId: link.ownerId,
      campaignId: link.campaignId,
      ts,
      referrer: isBot ? 'direct' : pickWeighted(REFERRERS),
      device,
      browser: isBot ? 'Unknown' : pickWeighted(BROWSERS),
      os: isBot ? 'Unknown' : pickWeighted(OS[device]),
      country: g[0],
      city: g[1],
      isBot,
      visitorHash: crypto.createHash('sha256').update(`${link.code}-${rnd(pool)}-${isBot}`).digest('hex').slice(0, 32),
    });
  }
  return docs;
}

await Promise.all([User.deleteMany({}), Campaign.deleteMany({}), Link.deleteMany({}), ClickEvent.deleteMany({}), Blocklist.deleteMany({})]);

const [admin, demo] = await User.create([
  { name: 'Admin', email: 'admin@linkpulse.dev', role: 'admin', passwordHash: await bcrypt.hash('Admin@123', 10) },
  { name: 'Demo User', email: 'demo@linkpulse.dev', role: 'user', passwordHash: await bcrypt.hash('Demo@12345', 10) },
]);

const [summer, docs, events] = await Campaign.create([
  { ownerId: demo._id, name: 'Summer Launch', description: 'Social and email push for the summer release' },
  { ownerId: demo._id, name: 'Product Docs', description: 'Documentation and onboarding links' },
  { ownerId: demo._id, name: 'Events', description: 'Webinars and meetups' },
]);

const hash = (p) => bcrypt.hash(p, 10);
const specs = [
  { code: 'summer-sale', dest: 'https://example.com/summer-sale', camp: summer, tags: ['promo', 'social'], clicks: 260, days: [0, 13] },
  { code: 'launch-blog', dest: 'https://example.com/blog/launch', camp: summer, tags: ['blog'], clicks: 150, days: [0, 13], expiresAt: new Date(Date.now() + 3 * DAY) },
  { code: 'docs-hub', dest: 'https://example.com/docs', camp: docs, tags: ['docs'], clicks: 210, days: [0, 13] },
  { code: 'quickstart', dest: 'https://example.com/docs/quickstart', camp: docs, tags: ['docs', 'onboarding'], clicks: 120, days: [0, 13] },
  { code: 'webinar', dest: 'https://example.com/webinar-recording', camp: events, tags: ['event'], clicks: 90, days: [7, 13], expiresAt: new Date(Date.now() - 6 * DAY) },
  { code: 'flash-50', dest: 'https://example.com/flash-sale', camp: summer, tags: ['promo'], clicks: 110, days: [0, 6], clickLimit: 100 },
  { code: 'beta-signup', dest: 'https://example.com/beta', camp: null, tags: ['beta'], clicks: 85, days: [0, 13], clickLimit: 100 },
  { code: 'secret-deck', dest: 'https://example.com/investor-deck', camp: null, tags: ['private'], clicks: 25, days: [0, 13], password: 'demo123' },
  { code: 'verify-now', dest: 'https://suspicious-example.test/login', camp: null, tags: [], clicks: 40, days: [4, 10], disabled: 'Reported as phishing' },
];

let allClicks = [];
for (const s of specs) {
  const link = await Link.create({
    code: s.code,
    destination: s.dest,
    ownerId: demo._id,
    campaignId: s.camp?._id ?? null,
    tags: s.tags,
    expiresAt: s.expiresAt ?? null,
    clickLimit: s.clickLimit ?? null,
    hasPassword: !!s.password,
    passwordHash: s.password ? await hash(s.password) : null,
    status: s.disabled ? 'disabled' : 'active',
    disabledBy: s.disabled ? 'admin' : null,
    disabledReason: s.disabled ?? null,
  });
  const clicks = makeClicks({ link, count: s.clicks, fromDay: s.days[0], toDay: s.days[1], pool: Math.max(8, Math.round(s.clicks * 0.6)) });
  const human = clicks.filter((c) => !c.isBot).length;
  // Keep clickCount consistent with the click limit.
  link.clickCount = s.clickLimit ? Math.min(human, s.clickLimit) : human;
  if (s.code === 'flash-50') link.clickCount = s.clickLimit; 
  if (s.code === 'beta-signup') link.clickCount = Math.min(human, 85); 
  await link.save();
  allClicks = allClicks.concat(clicks);
}


const statusLink = await Link.create({ code: 'status', destination: 'https://example.com/status', ownerId: admin._id, tags: ['ops'] });
allClicks = allClicks.concat(makeClicks({ link: statusLink, count: 30, fromDay: 0, toDay: 13, pool: 15 }));
statusLink.clickCount = allClicks.filter((c) => String(c.linkId) === String(statusLink._id) && !c.isBot).length;
await statusLink.save();

for (let i = 0; i < allClicks.length; i += 1000) await ClickEvent.insertMany(allClicks.slice(i, i + 1000));

console.log(`Seeded ${specs.length + 1} links, ${allClicks.length} clicks.\n`);
console.log('Admin : admin@linkpulse.dev / Admin@123');
console.log('User  : demo@linkpulse.dev  / Demo@12345');
console.log('Password-protected link: /secret-deck  (password: demo123)');
await mongoose.disconnect();
process.exit(0);

