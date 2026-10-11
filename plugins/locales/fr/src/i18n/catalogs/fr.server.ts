import language from "../../../locales/fr/__root/language.json";
import theme from "../../../locales/fr/__root/theme.json";
import home from "../../../locales/fr/index/page.json";

const french = { __root: { ...language, ...theme }, index: { ...home } };

export default french;
