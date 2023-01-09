import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    //pacton es una "request making library". Por eso, necesita una API/server para hacer una request. Por eso, inicio la app, y la pongo a escuchar en un puerto:
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'rob@asd.com',
      password: 'asdasd',
    };

    describe('Signup', () => {
      it('should throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400)
          .inspect();
      });
      it('should throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400)
          .inspect();
      });
      it('should throw error if no body is provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400).inspect();
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });

    describe('Signin', () => {
      it('should throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400)
          .inspect();
      });
      it('should throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400)
          .inspect();
      });
      it('should throw error if no body is provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400).inspect();
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token')
          .inspect();
      });
    });

    describe('User', () => {
      describe('Get me', () => {
        it('should get current user', () => {
          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({
              Authorization: `Bearer $S{userAccessToken}`,
            })
            .expectStatus(200);
        });
      });
      describe('Edit user', () => {
        it('should edit the name', () => {
          const dto: EditUserDto = {
            firstName: 'Rov',
            lastName: 'Alc',
            email: 'rovb@asd.com',
          };
          return pactum
            .spec()
            .patch('/users')
            .withBody(dto)
            .withHeaders({
              Authorization: 'Bearer $S{userAccessToken}',
            })
            .expectStatus(200)
            .expectBodyContains(dto.firstName)
            .expectBodyContains(dto.lastName)
            .expectBodyContains(dto.email)
            .inspect();
        });
      });
    });
  });
});

describe('Bookmarks', () => {
  describe('Create bookmark', () => {});
  describe('Get bookmark by id', () => {});
  describe('Edit bookmark', () => {});
  describe('Delete bookmark', () => {});
  describe('Get bookmarks', () => {});
});
