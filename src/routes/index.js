const router = require("express").Router();
const { apiLimiter } = require("../middlewares/rateLimiter");

router.use(apiLimiter);
router.use("/auth", require("./auth.routes"));
router.use("/shops", require("./shop.routes"));
router.use("/branches", require("./branch.routes"));
router.use("/categories", require("./category.routes"));
router.use("/items", require("./item.routes"));
router.use("/inventory", require("./inventory.routes"));
router.use("/cart", require("./cart.routes"));
router.use("/orders", require("./order.routes"));
router.use("/coupons", require("./coupon.routes"));
router.use("/wallet", require("./wallet.routes"));
router.use("/notifications", require("./notification.routes"));
router.use("/analytics", require("./analytics.routes"));
router.use("/users", require("./user.routes"));
router.use("/media", require("./media.routes"));

module.exports = router;
