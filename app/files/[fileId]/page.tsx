import FileDetailsPage from "@/app/components/FileDetailsPage";

const Page = async ({ params }: { params: Promise<{ fileId: string }> }) => {
  const resolvedParams = await params; // Await the Promise to resolve params
  const { fileId } = resolvedParams;

  return <FileDetailsPage fileId={fileId} />;
};

export default Page;
