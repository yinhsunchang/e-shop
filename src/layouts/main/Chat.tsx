import { useTranslation } from "react-i18next";
import { lazy, Suspense } from "react";

const ChatPortal = lazy(() => import("./ChatPortal.tsx"));

function Chat() {
  const { t } = useTranslation();

  return (
    <>
      <Suspense
        fallback={
          <div role="status" aria-live="polite">
            {t("loading")}
          </div>
        }
      >
        <ChatPortal />
      </Suspense>
    </>
  );
}

export default Chat;
