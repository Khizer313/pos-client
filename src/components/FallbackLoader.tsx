// components/FallbackLoader.tsx
import { Skeleton } from "@mui/material";

const FallbackLoader = ({ type = "modal" }: { type?: "modal" | "page" }) => {
  if (type === "modal") {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton height={40} width="60%" style={{ marginBottom: 16 }} />
        <Skeleton height={30} width="100%" style={{ marginBottom: 12 }} />
        <Skeleton height={30} width="100%" style={{ marginBottom: 12 }} />
        <Skeleton height={30} width="100%" style={{ marginBottom: 12 }} />
        <Skeleton variant="rectangular" height={36} width={100} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Skeleton height={50} width="30%" style={{ marginBottom: 16 }} />
      <Skeleton height={20} width="100%" style={{ marginBottom: 12 }} />
      <Skeleton height={400} width="100%" />
    </div>
  );
};

export default FallbackLoader;
