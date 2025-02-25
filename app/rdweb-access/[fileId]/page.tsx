import RdWebDetailsPage from "@/app/components/RdWebDetailsPage";

const Page = async ({ params }: { params: Promise<{ fileId: string }> }) => {
  const resolvedParams = await params; // Await the Promise to resolve params
  const { fileId } = resolvedParams;

  return <RdWebDetailsPage fileId={fileId} />;
};

export default Page;
