# Shared test support

Place shared fixtures, auth setup, or backend registration in named concern folders when real tests need them. Keep support beside one owner when only that owner uses it. Do not create a general `helpers.ts` dump or copy Apollo's source-text scanner as a testing shortcut.

Keep secrets and local run evidence out of support files. Persistent live-verification instructions belong in [verifications/](../../verifications/README.md); local evidence belongs in `.verifications/`.
