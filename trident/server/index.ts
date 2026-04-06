import express from 'express';
import { logger } from './lib/logger';
import cors from 'cors';
import dotenv from 'dotenv';
import operatorRoutes from './routes/operator';
import conduitRoutes from './routes/conduit';
import relayRoutes from './routes/relay';
import dispatchRoutes from './routes/dispatch';
import keystoneRoutes from './routes/keystone';
import sovereignRoutes from './routes/sovereign';
import solarisRoutes from './routes/solaris';
import sentinelRoutes from './routes/sentinel';
import primeRoutes from './routes/prime';
import paragonRoutes from './routes/paragon';
import pantheonRoutes from './routes/pantheon';
import overwatchRoutes from './routes/overwatch';
import overmindRoutes from './routes/overmind';
import oracleRoutes from './routes/oracle';
import omegaRoutes from './routes/omega';
import nexus2Routes from './routes/nexus2';
import nexusRoutes from './routes/nexus';
import monarchRoutes from './routes/monarch';
import lumenRoutes from './routes/lumen';
import infinityRoutes from './routes/infinity';
import hyperionRoutes from './routes/hyperion';
import helixRoutes from './routes/helix';
import heliosRoutes from './routes/helios';
import genesisRoutes from './routes/genesis';
import fusionRoutes from './routes/fusion';
import eternumRoutes from './routes/eternum';
import echelonRoutes from './routes/echelon';
import continuumRoutes from './routes/continuum';
import chronosRoutes from './routes/chronos';
import ascendantRoutes from './routes/ascendant';
import ascendRoutes from './routes/ascend';
import apexRoutes from './routes/apex';
import aegisRoutes from './routes/aegis';
import { api } from './api';
import { securityConfig } from './config/security';
import { env } from './config/env';
import { bootstrapAuditTrail } from './audit-trail';

// Load environment variables
dotenv.config();

const app = express();
app.disable('x-powered-by');

// Middleware
app.use(
  cors({
    origin: securityConfig.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Trident Backend Running', timestamp: new Date() });
});


// Mount the sovereign API (with Solana signature verification) at /api
app.use('/api', api.asExpressMiddleware());

// Engine routes will be mounted here
// Import routes dynamically as they're created
app.use('/operator', operatorRoutes);
app.use('/conduit', conduitRoutes);
app.use('/relay', relayRoutes);
app.use('/dispatch', dispatchRoutes);
app.use('/keystone', keystoneRoutes);

app.use('/sovereign', sovereignRoutes);
app.use('/solaris', solarisRoutes);
app.use('/sentinel', sentinelRoutes);
app.use('/prime', primeRoutes);
app.use('/paragon', paragonRoutes);
app.use('/pantheon', pantheonRoutes);
app.use('/overwatch', overwatchRoutes);
app.use('/overmind', overmindRoutes);
app.use('/oracle', oracleRoutes);
app.use('/omega', omegaRoutes);
app.use('/nexus2', nexus2Routes);
app.use('/nexus', nexusRoutes);
app.use('/monarch', monarchRoutes);
app.use('/lumen', lumenRoutes);
app.use('/infinity', infinityRoutes);
app.use('/hyperion', hyperionRoutes);
app.use('/helix', helixRoutes);
app.use('/helios', heliosRoutes);
app.use('/genesis', genesisRoutes);
app.use('/fusion', fusionRoutes);
app.use('/eternum', eternumRoutes);
app.use('/echelon', echelonRoutes);
app.use('/continuum', continuumRoutes);
app.use('/chronos', chronosRoutes);
app.use('/ascendant', ascendantRoutes);
app.use('/ascend', ascendRoutes);
app.use('/apex', apexRoutes);
app.use('/aegis', aegisRoutes);

const PORT = env.PORT;

if (!env.TRIDENT_JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET or TRIDENT_JWT_SECRET must be set');
  process.exit(1);
}

const start = async (): Promise<void> => {
  const server = app.listen(PORT, () => {
    logger.info(`Trident Server listening on port ${PORT}`);
  });

  await bootstrapAuditTrail(app, server, {
    jwtSecret: env.TRIDENT_JWT_SECRET,
    retentionDays: env.TRIDENT_AUDIT_RETENTION_DAYS,
  });
};

void start();
