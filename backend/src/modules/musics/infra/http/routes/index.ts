import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { VerifyJwt } from "../../../../../shared/middlewares/VerifyJWT";
import { CreateMusicControllerFactory } from "../../../factories/CreateMusicFactory";
import { GetMusicControllerFactory } from "../../../factories/GetMusicFactory";
import { LikeMusicControllerFactory } from "../../../factories/LikeMusicFactory";
import { ListTopMusicsControllerFactory } from "../../../factories/ListTopMusicsFactory";
import { SearchByArtistMusicControllerFactory } from "../../../factories/SearchByArtistMusicFactory";
import { SearchMusicControllerFactory } from "../../../factories/SearchMusicFactory";
import { UnlikeMusicControllerFactory } from "../../../factories/UnlikeMusicFactory";

const createMusicController =
  new CreateMusicControllerFactory().createController();
const getMusicController = new GetMusicControllerFactory().createController();
const listTopMusicsController =
  new ListTopMusicsControllerFactory().createController();
const likeMusicController = new LikeMusicControllerFactory().createController();
const searchMusicController =
  new SearchMusicControllerFactory().createController();
const unlikeMusicController =
  new UnlikeMusicControllerFactory().createController();
const searchByArtistMusicController =
  new SearchByArtistMusicControllerFactory().createController();

export const musicsRoutes = Router();

musicsRoutes.post("/", (req, res) => createMusicController.handler(req, res));

musicsRoutes.get("/hotspot", (req, res) =>
  listTopMusicsController.handler(req, res),
);

musicsRoutes.get("/search", (req, res) =>
  searchMusicController.handler(req, res),
);

musicsRoutes.get("/artist", (req, res) =>
  searchByArtistMusicController.handler(req, res),
);

const authorizationNotRequired = new VerifyJwt(false);
function notRequiredMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  authorizationNotRequired.verify(req, res, next);
}

musicsRoutes.get("/:id", notRequiredMiddleware, (req, res) =>
  getMusicController.handler(req, res),
);

const authorization = new VerifyJwt();

// Rotas autenticadas
musicsRoutes.use((req, res, next) => authorization.verify(req, res, next));

musicsRoutes.patch("/like/:music_id", (req, res) =>
  likeMusicController.handler(req, res),
);

musicsRoutes.patch("/unlike/:music_id", (req, res) =>
  unlikeMusicController.handler(req, res),
);
