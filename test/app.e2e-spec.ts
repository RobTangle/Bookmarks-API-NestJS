import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

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

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get no bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([])
          .inspect();
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Kubernetes Tutorial',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
        category: 'Back-end',
        keywords: ['back-end', 'kubernetes', 'server', 'microservice'],
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get the only bookmark', () => {
      it('should get one bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark by id', () => {
      it('shoud get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Get bookmarks', () => {
      it('should return the user bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        description: 'A great video!',
        category: 'general',
      };
      it('shoud edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('A great video!')
          .inspect();
      });
    });
    describe('Delete bookmark', () => {
      it('shoud edit bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(204);
      });
      it('should get no bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
