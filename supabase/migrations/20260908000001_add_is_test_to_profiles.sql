-- Markeer een profiel als testaccount, zodat het uit de cijfers op /admin valt.
--
-- Waarom een kolom en geen patroon op het e-mailadres: een heuristiek op "+test" of op
-- het eigen domein raadt, en raden is hier duur. Zeven van de veertien profielen zijn
-- testaccounts van de bouwer; zit de gok er één naast, dan is elk getal op het dashboard
-- verkeerd zonder dat iets faalt. Aanvinken in de gebruikerslijst is één handeling per
-- account en daarna staat het vast.
--
-- Waarom NOT NULL DEFAULT false: een profiel zonder waarde zou als "onbekend" moeten
-- worden geteld, en dat is een derde geval dat elke telling moet kennen. Nieuw account
-- is standaard echt; dat is de aanname die je wilt.
--
-- Zie docs/tdr/0006-admin-is-de-cockpit.md, beslissing 5.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_test IS
  'Handmatig gezet vanuit /admin/users. Sluit dit profiel uit van alle tellingen op het admin-dashboard.';
