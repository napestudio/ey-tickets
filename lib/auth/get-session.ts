import { cache } from "react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

/**
 * Cached wrapper around getServerSession.
 * React's cache() deduplicates calls within the same server request render tree,
 * so multiple Server Components calling getSession() in the same request
 * only execute the underlying getServerSession once.
 */
export const getSession = cache(() => getServerSession(authOptions));
