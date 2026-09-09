'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Search, FlaskConical } from 'lucide-react'
import { fetchUsers, setUserIsTest } from '@/app/actions/admin/users-list'
import type { AdminUserRow, UsersResult } from '@/lib/admin/list-types'

function datum(waarde: string | null): string {
  if (!waarde) return '—'
  return new Date(waarde).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

/**
 * De gebruikerslijst in het chatvenster.
 *
 * @ai-why: Zoeken, filteren en pagineren zitten hier in React-state en niet in
 * `searchParams` zoals op `/admin/users`. De chat navigeert niet tussen modi, dus een
 * URL-parameter zou nergens heen kunnen; en een halve pagina die wel de URL verandert
 * maar niet het venster is verwarrender dan geen URL-staat.
 *
 * @ai-gotcha: De aan/uit-knop voor testaccount schrijft meteen weg en draait bij een
 * fout terug. Zonder dat terugdraaien blijft een vinkje staan dat er in de database niet
 * is, en dan kloppen de cijfers op het overzicht opnieuw niet.
 *
 * @ai-sync: app/actions/admin/users-list.ts
 */
export function AdminUsersPane() {
  const [zoek, setZoek] = useState('')
  const [zoekTraag] = useDebounce(zoek, 300)
  const [rol, setRol] = useState('all')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<UsersResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bezig, setBezig] = useState<string | null>(null)

  useEffect(() => {
    let afgebroken = false
    setLoading(true)
    setError(null)

    fetchUsers({ q: zoekTraag, role: rol, page })
      .then((d) => !afgebroken && setData(d))
      .catch((e: unknown) => !afgebroken && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !afgebroken && setLoading(false))

    return () => {
      afgebroken = true
    }
  }, [zoekTraag, rol, page])

  // Terug naar de eerste pagina zodra het filter verandert, anders kijk je naar een
  // lege pagina 3 van een resultaat dat er maar één heeft.
  useEffect(() => {
    setPage(1)
  }, [zoekTraag, rol])

  async function wisselTest(user: AdminUserRow) {
    if (!data) return
    const nieuw = !user.is_test
    setBezig(user.id)
    setError(null)

    // Optimistisch, want de lijst voelt anders traag bij zeven vinkjes achter elkaar.
    setData({
      ...data,
      users: data.users.map((u) => (u.id === user.id ? { ...u, is_test: nieuw } : u)),
    })

    try {
      await setUserIsTest(user.id, nieuw)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
      setData((huidig) =>
        huidig
          ? {
              ...huidig,
              users: huidig.users.map((u) => (u.id === user.id ? { ...u, is_test: !nieuw } : u)),
            }
          : huidig,
      )
    } finally {
      setBezig(null)
    }
  }

  const testAantal = data?.users.filter((u) => u.is_test).length ?? 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-5 p-6 lg:p-8">
        <header className="border-b border-white/[0.06] pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Gebruikers</h1>
          <p className="mt-1 text-[13px] text-white/45">
            {data ? `${data.count} profielen` : 'Bezig met laden'}
            {data?.isTestAvailable
              ? `, ${testAantal} op deze pagina gemarkeerd als test`
              : ''}
            . Een testaccount telt nergens mee op het overzicht.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
            <input
              value={zoek}
              onChange={(e) => setZoek(e.target.value)}
              placeholder="Zoek op naam, gebruikersnaam of e-mail"
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2 pl-9 pr-3 text-[13px] text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none"
            />
          </div>

          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px] text-white/70 focus:border-white/20 focus:outline-none"
          >
            <option value="all">Alle rollen</option>
            {data?.roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/[0.07] p-4">
            <p className="text-[13px] text-[#FF3B30]">{error}</p>
          </div>
        )}

        {data && !data.isTestAvailable && (
          <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-4">
            <p className="text-[13px] text-white/45">
              Aanvinken als testaccount kan nog niet: de kolom <code>profiles.is_test</code>{' '}
              bestaat niet. Draai{' '}
              <code className="text-white/70">
                supabase/migrations/20260908000001_add_is_test_to_profiles.sql
              </code>
              .
            </p>
          </div>
        )}

        <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10.5px] uppercase tracking-[0.1em] text-white/30">
                  <th className="px-4 py-2.5 font-medium">Gebruiker</th>
                  <th className="px-4 py-2.5 font-medium">Rol</th>
                  <th className="px-4 py-2.5 font-medium">Aangemaakt</th>
                  <th className="px-4 py-2.5 font-medium">Laatst actief</th>
                  <th className="px-4 py-2.5 text-right font-medium">Testaccount</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="text-[13px] text-white">
                        {user.display_name || user.username || 'Naamloos'}
                      </div>
                      <div className="text-[11.5px] text-white/30">{user.email ?? '—'}</div>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] text-white/45">
                      {user.role ?? 'geen rol'}
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] tabular-nums text-white/45">
                      {datum(user.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] tabular-nums text-white/45">
                      {datum(user.last_active_at)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        disabled={!data.isTestAvailable || bezig === user.id}
                        onClick={() => wisselTest(user)}
                        aria-pressed={user.is_test}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          user.is_test
                            ? 'border-[#D4A843]/40 bg-[#D4A843]/10 text-[#D4A843]'
                            : 'border-white/[0.08] text-white/35 hover:text-white/60'
                        }`}
                      >
                        <FlaskConical className="h-3 w-3" />
                        {user.is_test ? 'Test' : 'Echt'}
                      </button>
                    </td>
                  </tr>
                ))}

                {data && data.users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-white/30">
                      Geen gebruikers gevonden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-[12.5px] text-white/40">
              <span>
                Pagina {data.page} van {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-white/[0.06] px-3 py-1 hover:text-white/70 disabled:opacity-30"
                >
                  Vorige
                </button>
                <button
                  type="button"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-white/[0.06] px-3 py-1 hover:text-white/70 disabled:opacity-30"
                >
                  Volgende
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
