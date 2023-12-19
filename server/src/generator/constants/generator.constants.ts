import { getProjectFileData } from '../generator.helpers';
import 'dotenv/config';

const corsOptions = `
    //origin: You can specify a specific origin (e.g., 'http://example.com'),
    //an array of allowed origins (['http://example.com', 'http://localhost:3000']),
    //or a regular expression (/^https://example.com$/) to allow only specific domains.
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], //Specify the HTTP methods that the server allows.
    credentials: true, //Setting credentials to true allows credentials to be included in requests, such as cookies and authorization headers
    preflightContinue: false, //If set to true, the application will handle preflight requests.
    exposedHeaders: ['Content-Length', 'Authorization'], // Expose additional headers to the client
    maxAge: 3600, // Specify the maximum age (in seconds) of preflight requests
    optionsSuccessStatus: 204, //Set the HTTP status code to be returned for successful preflight requests. The default value is 204 (No Content).`;

export async function generateSwaggerConfigOptions() {
  const dataPackageJson = await getProjectFileData('package.json');
  return await `
  const config = new DocumentBuilder()
    .setTitle('${dataPackageJson['name']}')
    .setDescription('${dataPackageJson['description']}')
    .setVersion('${dataPackageJson['version']}')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);`;
}

export function generateCorsConfigOptions() {
  return `app.enableCors({${corsOptions}
  });`;
}

export function generatePostgresConfigOptions() {
  return ` 
  TypeOrmModule.forRoot({
  "type": "postgres",
  "host": "localhost",
  "port": ${process.env.PG_PORT},
  "username": "${process.env.POSTGRES_USER}",
  "password": "${process.env.POSTGRES_PASSWORD}",
  "database": "${process.env.POSTGRES_DB_NAME}",
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "synchronize": process.env.NODE_ENV === 'production',
  }),`;
}
