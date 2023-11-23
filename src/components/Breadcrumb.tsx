interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div>
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pageName}
      </h2>
    </div>
  );
};

export default Breadcrumb;
