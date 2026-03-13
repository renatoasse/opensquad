import { useEffect } from "react";
import { useHierarchyStore, type Company, type Product, type Squad } from "@/store/useHierarchyStore";
import { useSquadStore } from "@/store/useSquadStore";

interface SectionHeaderProps {
  title: string;
  count?: number;
}

function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <div
      style={{
        padding: "12px 12px 6px",
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "var(--text-secondary)",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{title}</span>
      {count !== undefined && <span>{count}</span>}
    </div>
  );
}

interface ItemProps {
  icon: string;
  name: string;
  isActive?: boolean;
  isSelected?: boolean;
  indent?: number;
  onClick?: () => void;
  badge?: string;
}

function Item({ icon, name, isActive, isSelected, indent = 0, onClick, badge }: ItemProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        paddingLeft: 12 + indent * 12,
        cursor: "pointer",
        background: isSelected ? "var(--bg-selected)" : "transparent",
        borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
        fontSize: 12,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "var(--bg-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
      {badge && (
        <span
          style={{
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 4,
            background: "var(--accent)",
            color: "white",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

export function HierarchySidebar() {
  const companies = useHierarchyStore((s) => s.companies);
  const products = useHierarchyStore((s) => s.products);
  const squads = useHierarchyStore((s) => s.squads);
  const activeCompanyId = useHierarchyStore((s) => s.activeCompanyId);
  const activeProductId = useHierarchyStore((s) => s.activeProductId);
  const selectCompany = useHierarchyStore((s) => s.selectCompany);
  const selectProduct = useHierarchyStore((s) => s.selectProduct);
  const setCompanies = useHierarchyStore((s) => s.setCompanies);
  const setProducts = useHierarchyStore((s) => s.setProducts);
  const setSquads = useHierarchyStore((s) => s.setSquads);
  const isLoading = useHierarchyStore((s) => s.isLoading);
  const setLoading = useHierarchyStore((s) => s.setLoading);

  const squadStoreSquads = useSquadStore((s) => s.squads);
  const activeStates = useSquadStore((s) => s.activeStates);
  const selectedSquad = useSquadStore((s) => s.selectedSquad);
  const selectSquad = useSquadStore((s) => s.selectSquad);

  // Fetch hierarchy data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [companiesRes, productsRes, squadsRes] = await Promise.all([
          fetch("/__api/companies"),
          fetch("/__api/products"),
          fetch("/__api/squads"),
        ]);

        if (companiesRes.ok) {
          const data = await companiesRes.json();
          setCompanies(data);
        }

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data);
        }

        if (squadsRes.ok) {
          const data = await squadsRes.json();
          setSquads(data);
        }
      } catch (e) {
        console.error("Failed to fetch hierarchy:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setCompanies, setProducts, setSquads, setLoading]);

  // Filter products by active company
  const filteredProducts = activeCompanyId
    ? products.filter((p) => p.company_id === activeCompanyId)
    : [];

  // Filter squads by active product
  const filteredSquads = activeProductId
    ? squads.filter((s) => s.product_id === activeProductId)
    : [];

  // Squads from squadStore (file-based)
  const fileBasedSquads = Array.from(squadStoreSquads.values());

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        height: "100%",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Companies Section */}
      <SectionHeader title="Companies" count={companies.length} />
      <div style={{ maxHeight: 120, overflowY: "auto" }}>
        {isLoading && (
          <div style={{ padding: "8px 12px", fontSize: 11, color: "var(--text-secondary)" }}>
            Loading...
          </div>
        )}
        {!isLoading && companies.length === 0 && (
          <div style={{ padding: "8px 12px", fontSize: 11, color: "var(--text-secondary)" }}>
            No companies. Run `opensquad company add`
          </div>
        )}
        {companies.map((company) => (
          <Item
            key={company.id}
            icon={company.icon}
            name={company.name}
            isActive={company.id === activeCompanyId}
            isSelected={company.id === activeCompanyId}
            onClick={() => selectCompany(company.id)}
          />
        ))}
      </div>

      {/* Products Section */}
      {activeCompanyId && (
        <>
          <SectionHeader title="Products" count={filteredProducts.length} />
          <div style={{ maxHeight: 120, overflowY: "auto" }}>
            {filteredProducts.length === 0 && (
              <div style={{ padding: "8px 12px", fontSize: 11, color: "var(--text-secondary)" }}>
                No products. Run `opensquad product add`
              </div>
            )}
            {filteredProducts.map((product) => (
              <Item
                key={product.id}
                icon={product.icon}
                name={product.name}
                isActive={product.id === activeProductId}
                isSelected={product.id === activeProductId}
                indent={1}
                onClick={() => selectProduct(product.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Squads Section */}
      <SectionHeader title="Squads" />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Show DB squads if product is selected */}
        {activeProductId && filteredSquads.length > 0 && (
          <>
            {filteredSquads.map((squad) => {
              const isActive = activeStates.has(squad.code);
              return (
                <Item
                  key={squad.id}
                  icon={squad.icon}
                  name={squad.name}
                  isSelected={selectedSquad === squad.code}
                  indent={2}
                  onClick={() => selectSquad(squad.code)}
                  badge={isActive ? "active" : undefined}
                />
              );
            })}
          </>
        )}

        {/* Show file-based squads */}
        {fileBasedSquads.length > 0 && (
          <>
            {!activeProductId && (
              <div
                style={{
                  padding: "4px 12px",
                  fontSize: 10,
                  color: "var(--text-secondary)",
                }}
              >
                From files:
              </div>
            )}
            {fileBasedSquads.map((squad) => {
              const isActive = activeStates.has(squad.code);
              return (
                <Item
                  key={squad.code}
                  icon={squad.icon}
                  name={squad.name}
                  isSelected={selectedSquad === squad.code}
                  indent={activeProductId ? 2 : 0}
                  onClick={() => selectSquad(squad.code)}
                  badge={isActive ? "active" : undefined}
                />
              );
            })}
          </>
        )}

        {!activeProductId && fileBasedSquads.length === 0 && (
          <div style={{ padding: "8px 12px", fontSize: 11, color: "var(--text-secondary)" }}>
            Select a product to see squads
          </div>
        )}
      </div>
    </aside>
  );
}
