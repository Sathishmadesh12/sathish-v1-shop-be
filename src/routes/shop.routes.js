const router = require("express").Router();
const { shop } = require("../controllers/index");
const { protect } = require("../middlewares/auth");
const roleGuard = require("../middlewares/roleGuard");
const upload = require("../middlewares/upload");

router.get("/", shop.getAll);
router.get("/:id", shop.getById);
router.post(
  "/",
  protect,
  roleGuard("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "paymentQr", maxCount: 1 },
  ]),
  shop.create,
);
router.put(
  "/:id",
  protect,
  roleGuard("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "paymentQr", maxCount: 1 },
  ]),
  shop.update,
);
router.delete("/:id", protect, roleGuard("admin"), shop.delete);
router.patch("/:id/toggle", protect, roleGuard("admin"), shop.toggleStatus);

module.exports = router;
