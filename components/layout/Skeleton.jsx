"use clients";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Shemar = ({ count }) => {
  return <Skeleton count={count || 5} />;
};

export default Shemar;
