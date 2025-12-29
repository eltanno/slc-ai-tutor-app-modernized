"""Note CRUD views."""

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from ..models import Note
from ..serializers import NoteSerializer
from ..utils import get_pagination_data


class Notes(generics.GenericAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user).order_by('-id')

    def get(self, request):
        notes = self.get_queryset()
        total_items = notes.count()
        pagination = get_pagination_data(self.request, total_items)
        # use zero-based slice indices
        serializer = self.serializer_class(
            notes[pagination['start_index'] : pagination['end_index']], many=True
        )
        return Response(
            {
                'status': 'success',
                'pagination': pagination,
                'items': serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(
                {
                    'status': 'success',
                    'message': 'Note created successfully',
                    'note': serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {
                'status': 'fail',
                'message': 'Note creation failed',
                'errors': serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class NoteDetail(generics.GenericAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def get_note(self, pk):
        try:
            return self.get_queryset().get(pk=pk)
        except Note.DoesNotExist:
            return None

    def get(self, request, pk):
        note = self.get_note(pk)
        if note:
            serializer = self.serializer_class(note)
            return Response(
                {'status': 'success', 'note': serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(
            {'status': 'fail', 'message': 'Note not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    def put(self, request, pk):
        note = self.get_note(pk)
        if note:
            serializer = self.serializer_class(note, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        'status': 'success',
                        'message': 'Note updated successfully',
                        'note': serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    'status': 'fail',
                    'message': 'Note update failed',
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {'status': 'fail', 'message': 'Note not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    def delete(self, request, pk):
        note = self.get_note(pk)
        if note:
            note.delete()
            return Response(
                {'status': 'success', 'message': 'Note deleted successfully'},
                status=status.HTTP_204_NO_CONTENT,
            )
        return Response(
            {'status': 'fail', 'message': 'Note not found'},
            status=status.HTTP_404_NOT_FOUND,
        )
