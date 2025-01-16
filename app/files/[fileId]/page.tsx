import FileDetailsPage from "@/app/components/FileDetailsPage";


const Page = async ({ params }: { params: { fileId: string } }) => {
  const { fileId } = params;

  return <FileDetailsPage fileId={fileId} />;
};

export default Page;
