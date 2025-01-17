import ShellFileDetailsPage from "@/app/components/ShellDetailsPage";

const Page = async ({ params }: { params: Promise<{ fileId: string }> }) => {
  const resolvedParams = await params; // Await the Promise to resolve params
  const { fileId } = resolvedParams;

  return <ShellFileDetailsPage fileId={fileId} />;
};

export default Page;
