import YearbookGallery from '../components/YearbookGallery';
import ProtectedRoute from '../components/ProtectedRoute';

export default function YearbooksPage() {
  return (
    <ProtectedRoute>
      <YearbookGallery />
    </ProtectedRoute>
  );
}