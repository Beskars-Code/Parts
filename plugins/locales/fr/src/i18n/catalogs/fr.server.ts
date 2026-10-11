import language from "../../../locales/fr/__root/language.json";
import theme from "../../../locales/fr/__root/theme.json";
import admin from "../../../locales/fr/index/admin.json";
import auth from "../../../locales/fr/index/auth.json";
import billing from "../../../locales/fr/index/billing.json";
import errors from "../../../locales/fr/index/errors.json";
import home from "../../../locales/fr/index/page.json";
import todos from "../../../locales/fr/index/todos.json";

const french = { __root: { ...language, ...theme }, index: { ...home, ...auth, ...todos, ...billing, ...admin, ...errors } };

export default french;
