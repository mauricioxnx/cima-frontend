import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Users, Shield, Package, Truck, ArrowLeftRight,
  Wrench, ClipboardList, Car, History, BarChart3, LogOut, Bell, ChevronRight
} from 'lucide-react'
import styles from './Layout.module.css'

const nav = [
  { label: 'Dashboard',     to: '/dashboard',    icon: LayoutDashboard },
  { section: 'Recursos Humanos' },
  { label: 'Utilizadores',  to: '/utilizadores', icon: Users },
  { label: 'Perfis',        to: '/perfis',        icon: Shield },
  { section: 'Stock & Compras' },
  { label: 'Inventário',    to: '/inventario',    icon: Package },
  { label: 'Fornecedores',  to: '/fornecedores',  icon: Truck },
  { label: 'Mov. de Stock', to: '/movimentos',    icon: ArrowLeftRight },
  { section: 'Manutenção' },
  { label: 'Manutenções',   to: '/manutencoes',   icon: Wrench },
  { label: 'Tarefas',       to: '/tarefas',       icon: ClipboardList },
  { label: 'Máq. / Veículos',to: '/maquinas',     icon: Car },
  { section: 'Análise' },
  { label: 'Histórico',     to: '/historico',     icon: History },
  { label: 'Relatórios',    to: '/relatorios',    icon: BarChart3 },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.nome?.split(' ').map(w => w[0]).slice(0,2).join('') ?? 'AD'

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>C</span>
          <div>
            <div className={styles.logoName}>CIMA</div>
            <div className={styles.logoSub}>Gestão Integrada</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {nav.map((item, i) =>
            item.section ? (
              <div key={i} className={styles.section}>{item.section}</div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <item.icon size={15} strokeWidth={1.8} />
                <span>{item.label}</span>
                <ChevronRight size={12} className={styles.chevron} />
              </NavLink>
            )
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.nome ?? 'Utilizador'}</div>
              <div className={styles.userRole}>{user?.perfil ?? ''}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Terminar sessão">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.pageIndicator}>
              <span className={styles.dot} />
              Sistema activo
            </div>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.notifBtn}>
              <Bell size={15} />
              <span className={styles.notifBadge}>5</span>
            </div>
            <div className={styles.topDate}>
              {new Date().toLocaleDateString('pt-AO', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
