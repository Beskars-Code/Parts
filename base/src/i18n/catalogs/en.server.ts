import language from "../../../locales/en/__root/language.json";
import theme from "../../../locales/en/__root/theme.json";
import admin from "../../../locales/en/index/admin.json";
import auth from "../../../locales/en/index/auth.json";
import billing from "../../../locales/en/index/billing.json";
import errors from "../../../locales/en/index/errors.json";
import home from "../../../locales/en/index/page.json";
import todos from "../../../locales/en/index/todos.json";

const english = { __root: { ...language, ...theme }, index: { ...home, ...auth, ...todos, ...billing, ...admin, ...errors } };

export default english;
