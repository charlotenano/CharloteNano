create table if not exists public.site_stats (
  key text primary key,
  hearts bigint not null default 0 check (hearts >= 0)
);

insert into public.site_stats (key, hearts)
values ('portfolio', 0)
on conflict (key) do nothing;

alter table public.site_stats enable row level security;

create or replace function public.get_heart_count()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select hearts
  from public.site_stats
  where key = 'portfolio';
$$;

create or replace function public.increment_heart_count()
returns bigint
language sql
volatile
security definer
set search_path = ''
as $$
  update public.site_stats
  set hearts = hearts + 1
  where key = 'portfolio'
  returning hearts;
$$;

revoke all on public.site_stats from anon, authenticated;
revoke all on function public.get_heart_count() from public, anon, authenticated;
revoke all on function public.increment_heart_count() from public, anon, authenticated;

grant execute on function public.get_heart_count() to anon;
grant execute on function public.increment_heart_count() to anon;
