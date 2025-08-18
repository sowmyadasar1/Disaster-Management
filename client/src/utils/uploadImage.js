/**
 * Skips uploading an image and always returns a success response.
 *
 * @param {File} file - Ignored.
 * @returns {Promise<{ success: boolean, url: null }>}
 */
export const uploadImage = async (file) => {
  // Just return success with no URL — nothing is uploaded.
  return { success: true, url: null };
};
