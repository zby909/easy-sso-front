/*
这个配置告诉 commitlint 使用 @commitlint/config-conventional 这套规则集，
也就是业界流行的 "Conventional Commits" 规范（例如，必须以 feat:, fix:, docs: 等开头）。
*/
export default {
  extends: ['@commitlint/config-conventional'],
};
