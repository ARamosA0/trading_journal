import { useContext, useEffect } from 'react';
import { HeaderContext } from '../../hook/HeaderContext';
import { useAuth } from '../../authContext/context';

function Profile() {
  const { setHeader } = useContext(HeaderContext);
  const { user } = useAuth();
  useEffect(() => { setHeader({ title: 'Profile', subtitle: 'Identity, preferences and account access.' }); }, [setHeader]);

  return <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)]">
    <form className="journal-panel p-5 sm:p-7" onSubmit={(event) => event.preventDefault()}>
      <div className="border-b border-[var(--border)] pb-5"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Personal details</p><h2 className="mt-2 text-xl font-semibold text-[var(--text)]">Your profile</h2><p className="mt-1 text-sm text-[var(--text3)]">This information identifies you across the journal.</p></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs text-[var(--text2)]">Username<input value={user?.userName ?? ''} readOnly className="mt-2 opacity-70" /></label><label className="text-xs text-[var(--text2)]">Email<input value={user?.email ?? ''} readOnly className="mt-2 opacity-70" /></label><label className="text-xs text-[var(--text2)] sm:col-span-2">Display name<input defaultValue={user?.userName ?? ''} className="mt-2" /></label></div>
      <div className="mt-6 flex justify-end"><button type="submit" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#061016]">Save changes</button></div>
    </form>
    <aside className="journal-panel p-5 sm:p-7"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Security</p><h2 className="mt-2 text-xl font-semibold text-[var(--text)]">Account access</h2><div className="mt-6 divide-y divide-[var(--border)]"><div className="flex items-center justify-between gap-4 py-4 first:pt-0"><span className="text-sm text-[var(--text2)]">Role</span><span className="rounded-md bg-[var(--accent-dim)] px-2 py-1 text-xs font-semibold text-[var(--accent)]">{user?.role ?? 'USER'}</span></div><div className="flex items-center justify-between gap-4 py-4"><span className="text-sm text-[var(--text2)]">Session</span><span className="text-xs text-[var(--green)]">Active</span></div></div><button type="button" className="mt-5 w-full rounded-lg border border-[var(--border2)] px-4 py-2 text-sm text-[var(--text2)] hover:border-[var(--text3)] hover:text-[var(--text)]">Change password</button></aside>
  </section>;
}

export default Profile;
