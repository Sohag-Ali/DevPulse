
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

const config = {
  port: process.env.PORT || 5000,
  connectionString: process.env.CONNECTION_STRING as string || '',
  jwtSecret: process.env.JWT_SECRET as string,
  clientUrl: process.env.CLIENT_URL as string || 'http://localhost:5000',
};

export default config;