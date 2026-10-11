import language from "../../../locales/en/__root/language.json";
import theme from "../../../locales/en/__root/theme.json";
import home from "../../../locales/en/index/page.json";

const english = { __root: { ...language, ...theme }, index: { ...home } };

export default english;
