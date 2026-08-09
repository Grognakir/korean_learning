export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accepted_answers: {
        Row: {
          created_at: string;
          exercise_id: string;
          id: string;
          is_canonical: boolean;
          normalized_value: string;
          raw_value: string;
          review_status: Database["public"]["Enums"]["accepted_answer_review_status"];
          variant_note_ru: string | null;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          id?: string;
          is_canonical?: boolean;
          normalized_value: string;
          raw_value: string;
          review_status?: Database["public"]["Enums"]["accepted_answer_review_status"];
          variant_note_ru?: string | null;
        };
        Update: {
          created_at?: string;
          exercise_id?: string;
          id?: string;
          is_canonical?: boolean;
          normalized_value?: string;
          raw_value?: string;
          review_status?: Database["public"]["Enums"]["accepted_answer_review_status"];
          variant_note_ru?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "accepted_answers_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_generation_requests: {
        Row: {
          created_at: string;
          error_code: string | null;
          estimated_cost: number | null;
          id: string;
          input_hash: string;
          latency_ms: number | null;
          model: string;
          prompt_template_version: string;
          purpose: string;
          request_count: number;
          requested_by: string | null;
          status: Database["public"]["Enums"]["ai_generation_status"];
          token_input: number | null;
          token_output: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          error_code?: string | null;
          estimated_cost?: number | null;
          id?: string;
          input_hash: string;
          latency_ms?: number | null;
          model: string;
          prompt_template_version: string;
          purpose: string;
          request_count?: number;
          requested_by?: string | null;
          status?: Database["public"]["Enums"]["ai_generation_status"];
          token_input?: number | null;
          token_output?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          error_code?: string | null;
          estimated_cost?: number | null;
          id?: string;
          input_hash?: string;
          latency_ms?: number | null;
          model?: string;
          prompt_template_version?: string;
          purpose?: string;
          request_count?: number;
          requested_by?: string | null;
          status?: Database["public"]["Enums"]["ai_generation_status"];
          token_input?: number | null;
          token_output?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      attempts: {
        Row: {
          answer_version: string;
          answered_at: string;
          attempt_number: number;
          duration_ms: number | null;
          exercise_id: string;
          id: string;
          idempotency_key: string;
          is_correct: boolean;
          normalized_answer: Json;
          raw_answer: Json;
          reason_code: string;
          score: number;
          session_id: string;
          user_id: string;
        };
        Insert: {
          answer_version: string;
          answered_at?: string;
          attempt_number: number;
          duration_ms?: number | null;
          exercise_id: string;
          id?: string;
          idempotency_key: string;
          is_correct: boolean;
          normalized_answer: Json;
          raw_answer: Json;
          reason_code: string;
          score: number;
          session_id: string;
          user_id: string;
        };
        Update: {
          answer_version?: string;
          answered_at?: string;
          attempt_number?: number;
          duration_ms?: number | null;
          exercise_id?: string;
          id?: string;
          idempotency_key?: string;
          is_correct?: boolean;
          normalized_answer?: Json;
          raw_answer?: Json;
          reason_code?: string;
          score?: number;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attempts_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempts_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "training_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      content_provenance: {
        Row: {
          confidence: Database["public"]["Enums"]["content_confidence"];
          content_version: string;
          created_at: string;
          entity_logical_id: string;
          entity_type: Database["public"]["Enums"]["content_review_entity_type"];
          id: string;
          locator: string;
          note: string | null;
          record_hash: string;
          review_state: Database["public"]["Enums"]["content_lifecycle_status"];
          source_id: string;
        };
        Insert: {
          confidence?: Database["public"]["Enums"]["content_confidence"];
          content_version: string;
          created_at?: string;
          entity_logical_id: string;
          entity_type: Database["public"]["Enums"]["content_review_entity_type"];
          id?: string;
          locator: string;
          note?: string | null;
          record_hash: string;
          review_state?: Database["public"]["Enums"]["content_lifecycle_status"];
          source_id: string;
        };
        Update: {
          confidence?: Database["public"]["Enums"]["content_confidence"];
          content_version?: string;
          created_at?: string;
          entity_logical_id?: string;
          entity_type?: Database["public"]["Enums"]["content_review_entity_type"];
          id?: string;
          locator?: string;
          note?: string | null;
          record_hash?: string;
          review_state?: Database["public"]["Enums"]["content_lifecycle_status"];
          source_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_provenance_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "content_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      content_reviews: {
        Row: {
          content_version: string;
          created_at: string;
          decision: Database["public"]["Enums"]["content_review_decision"];
          entity_id: string;
          entity_type: Database["public"]["Enums"]["content_review_entity_type"];
          id: string;
          notes: string | null;
          reviewer_label: string;
          reviewer_user_id: string | null;
        };
        Insert: {
          content_version: string;
          created_at?: string;
          decision: Database["public"]["Enums"]["content_review_decision"];
          entity_id: string;
          entity_type: Database["public"]["Enums"]["content_review_entity_type"];
          id?: string;
          notes?: string | null;
          reviewer_label: string;
          reviewer_user_id?: string | null;
        };
        Update: {
          content_version?: string;
          created_at?: string;
          decision?: Database["public"]["Enums"]["content_review_decision"];
          entity_id?: string;
          entity_type?: Database["public"]["Enums"]["content_review_entity_type"];
          id?: string;
          notes?: string | null;
          reviewer_label?: string;
          reviewer_user_id?: string | null;
        };
        Relationships: [];
      };
      content_sources: {
        Row: {
          created_at: string;
          derived: boolean;
          display_label: string;
          id: string;
          kind: string;
          note: string | null;
          source_key: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          derived?: boolean;
          display_label: string;
          id?: string;
          kind: string;
          note?: string | null;
          source_key: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          derived?: boolean;
          display_label?: string;
          id?: string;
          kind?: string;
          note?: string | null;
          source_key?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      dictionary_entries: {
        Row: {
          content_version: string;
          created_at: string;
          id: string;
          lemma_ko: string;
          level: string | null;
          logical_id: string;
          meanings_ru: Json;
          module_id: string;
          normalized_lemma_ko: string;
          part_of_speech: string;
          sense_key: string;
          status: Database["public"]["Enums"]["content_lifecycle_status"];
          transliteration: string | null;
          updated_at: string;
          usage_note_ru: string | null;
        };
        Insert: {
          content_version: string;
          created_at?: string;
          id?: string;
          lemma_ko: string;
          level?: string | null;
          logical_id: string;
          meanings_ru: Json;
          module_id: string;
          normalized_lemma_ko: string;
          part_of_speech: string;
          sense_key: string;
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          transliteration?: string | null;
          updated_at?: string;
          usage_note_ru?: string | null;
        };
        Update: {
          content_version?: string;
          created_at?: string;
          id?: string;
          lemma_ko?: string;
          level?: string | null;
          logical_id?: string;
          meanings_ru?: Json;
          module_id?: string;
          normalized_lemma_ko?: string;
          part_of_speech?: string;
          sense_key?: string;
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          transliteration?: string | null;
          updated_at?: string;
          usage_note_ru?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "dictionary_entries_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      dictionary_entry_modules: {
        Row: {
          entry_id: string;
          module_id: string;
          role: Database["public"]["Enums"]["dictionary_module_role"];
          sort_order: number;
        };
        Insert: {
          entry_id: string;
          module_id: string;
          role?: Database["public"]["Enums"]["dictionary_module_role"];
          sort_order?: number;
        };
        Update: {
          entry_id?: string;
          module_id?: string;
          role?: Database["public"]["Enums"]["dictionary_module_role"];
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "dictionary_entry_modules_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "dictionary_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dictionary_entry_modules_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_dictionary_entries: {
        Row: {
          dictionary_entry_id: string;
          exercise_id: string;
          role: Database["public"]["Enums"]["exercise_dictionary_role"];
        };
        Insert: {
          dictionary_entry_id: string;
          exercise_id: string;
          role?: Database["public"]["Enums"]["exercise_dictionary_role"];
        };
        Update: {
          dictionary_entry_id?: string;
          exercise_id?: string;
          role?: Database["public"]["Enums"]["exercise_dictionary_role"];
        };
        Relationships: [
          {
            foreignKeyName: "exercise_dictionary_entries_dictionary_entry_id_fkey";
            columns: ["dictionary_entry_id"];
            isOneToOne: false;
            referencedRelation: "dictionary_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_dictionary_entries_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_options: {
        Row: {
          exercise_id: string;
          explanation_ru: string | null;
          id: string;
          is_correct: boolean;
          label_ko: string | null;
          label_ru: string | null;
          option_key: string;
          sort_order: number;
          value_payload: Json;
        };
        Insert: {
          exercise_id: string;
          explanation_ru?: string | null;
          id?: string;
          is_correct?: boolean;
          label_ko?: string | null;
          label_ru?: string | null;
          option_key: string;
          sort_order?: number;
          value_payload?: Json;
        };
        Update: {
          exercise_id?: string;
          explanation_ru?: string | null;
          id?: string;
          is_correct?: boolean;
          label_ko?: string | null;
          label_ru?: string | null;
          option_key?: string;
          sort_order?: number;
          value_payload?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_options_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_topics: {
        Row: {
          exercise_id: string;
          role: Database["public"]["Enums"]["exercise_topic_role"];
          topic_id: string;
        };
        Insert: {
          exercise_id: string;
          role?: Database["public"]["Enums"]["exercise_topic_role"];
          topic_id: string;
        };
        Update: {
          exercise_id?: string;
          role?: Database["public"]["Enums"]["exercise_topic_role"];
          topic_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_topics_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_topics_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "grammar_topics";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          content_version: string;
          created_at: string;
          difficulty: Database["public"]["Enums"]["exercise_difficulty"];
          explanation_ru: string;
          id: string;
          learning_skill: Database["public"]["Enums"]["learning_skill"];
          logical_id: string;
          module_id: string;
          payload: Json;
          primary_topic_id: string | null;
          prompt_ko: string | null;
          prompt_ru: string | null;
          reading_passage_id: string | null;
          source: Database["public"]["Enums"]["exercise_source"];
          source_generation_id: string | null;
          status: Database["public"]["Enums"]["exercise_lifecycle_status"];
          type: Database["public"]["Enums"]["exercise_type"];
          updated_at: string;
        };
        Insert: {
          content_version: string;
          created_at?: string;
          difficulty: Database["public"]["Enums"]["exercise_difficulty"];
          explanation_ru: string;
          id?: string;
          learning_skill?: Database["public"]["Enums"]["learning_skill"];
          logical_id: string;
          module_id: string;
          payload?: Json;
          primary_topic_id?: string | null;
          prompt_ko?: string | null;
          prompt_ru?: string | null;
          reading_passage_id?: string | null;
          source?: Database["public"]["Enums"]["exercise_source"];
          source_generation_id?: string | null;
          status?: Database["public"]["Enums"]["exercise_lifecycle_status"];
          type: Database["public"]["Enums"]["exercise_type"];
          updated_at?: string;
        };
        Update: {
          content_version?: string;
          created_at?: string;
          difficulty?: Database["public"]["Enums"]["exercise_difficulty"];
          explanation_ru?: string;
          id?: string;
          learning_skill?: Database["public"]["Enums"]["learning_skill"];
          logical_id?: string;
          module_id?: string;
          payload?: Json;
          primary_topic_id?: string | null;
          prompt_ko?: string | null;
          prompt_ru?: string | null;
          reading_passage_id?: string | null;
          source?: Database["public"]["Enums"]["exercise_source"];
          source_generation_id?: string | null;
          status?: Database["public"]["Enums"]["exercise_lifecycle_status"];
          type?: Database["public"]["Enums"]["exercise_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercises_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercises_primary_topic_id_fkey";
            columns: ["primary_topic_id"];
            isOneToOne: false;
            referencedRelation: "grammar_topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercises_reading_passage_id_fkey";
            columns: ["reading_passage_id"];
            isOneToOne: false;
            referencedRelation: "reading_passages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercises_source_generation_id_fkey";
            columns: ["source_generation_id"];
            isOneToOne: true;
            referencedRelation: "generated_exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      generated_exercises: {
        Row: {
          candidate_payload: Json;
          content_status: Database["public"]["Enums"]["generated_content_status"];
          created_at: string;
          generation_request_id: string | null;
          id: string;
          schema_version: string;
          updated_at: string;
          validation_status: Database["public"]["Enums"]["generated_validation_status"];
        };
        Insert: {
          candidate_payload: Json;
          content_status?: Database["public"]["Enums"]["generated_content_status"];
          created_at?: string;
          generation_request_id?: string | null;
          id?: string;
          schema_version: string;
          updated_at?: string;
          validation_status?: Database["public"]["Enums"]["generated_validation_status"];
        };
        Update: {
          candidate_payload?: Json;
          content_status?: Database["public"]["Enums"]["generated_content_status"];
          created_at?: string;
          generation_request_id?: string | null;
          id?: string;
          schema_version?: string;
          updated_at?: string;
          validation_status?: Database["public"]["Enums"]["generated_validation_status"];
        };
        Relationships: [
          {
            foreignKeyName: "generated_exercises_generation_request_id_fkey";
            columns: ["generation_request_id"];
            isOneToOne: false;
            referencedRelation: "ai_generation_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      grammar_topics: {
        Row: {
          category: string;
          code: string;
          content_version: string;
          created_at: string;
          id: string;
          level: string;
          logical_id: string;
          module_id: string;
          pattern_ko: string;
          rule_payload: Json;
          sort_order: number;
          status: Database["public"]["Enums"]["content_lifecycle_status"];
          summary_ru: string;
          title: string;
          updated_at: string;
          usage_key: string | null;
        };
        Insert: {
          category: string;
          code: string;
          content_version: string;
          created_at?: string;
          id?: string;
          level: string;
          logical_id: string;
          module_id: string;
          pattern_ko: string;
          rule_payload?: Json;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          summary_ru: string;
          title: string;
          updated_at?: string;
          usage_key?: string | null;
        };
        Update: {
          category?: string;
          code?: string;
          content_version?: string;
          created_at?: string;
          id?: string;
          level?: string;
          logical_id?: string;
          module_id?: string;
          pattern_ko?: string;
          rule_payload?: Json;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          summary_ru?: string;
          title?: string;
          updated_at?: string;
          usage_key?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "grammar_topics_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      honorific_pairs: {
        Row: {
          content_version: string;
          created_at: string;
          honorific_entry_id: string;
          id: string;
          module_id: string;
          plain_entry_id: string;
          relation_type: Database["public"]["Enums"]["honorific_relation_type"];
          status: Database["public"]["Enums"]["content_lifecycle_status"];
          updated_at: string;
          usage_note_ru: string | null;
        };
        Insert: {
          content_version: string;
          created_at?: string;
          honorific_entry_id: string;
          id?: string;
          module_id: string;
          plain_entry_id: string;
          relation_type?: Database["public"]["Enums"]["honorific_relation_type"];
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          updated_at?: string;
          usage_note_ru?: string | null;
        };
        Update: {
          content_version?: string;
          created_at?: string;
          honorific_entry_id?: string;
          id?: string;
          module_id?: string;
          plain_entry_id?: string;
          relation_type?: Database["public"]["Enums"]["honorific_relation_type"];
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          updated_at?: string;
          usage_note_ru?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "honorific_pairs_honorific_entry_id_fkey";
            columns: ["honorific_entry_id"];
            isOneToOne: false;
            referencedRelation: "dictionary_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "honorific_pairs_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "honorific_pairs_plain_entry_id_fkey";
            columns: ["plain_entry_id"];
            isOneToOne: false;
            referencedRelation: "dictionary_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_modules: {
        Row: {
          content_version: string;
          created_at: string;
          description_ru: string;
          id: string;
          level: string;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_lifecycle_status"];
          title_ko: string;
          title_ru: string;
          unit_number: number | null;
          updated_at: string;
        };
        Insert: {
          content_version: string;
          created_at?: string;
          description_ru: string;
          id?: string;
          level: string;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          title_ko: string;
          title_ru: string;
          unit_number?: number | null;
          updated_at?: string;
        };
        Update: {
          content_version?: string;
          created_at?: string;
          description_ru?: string;
          id?: string;
          level?: string;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          title_ko?: string;
          title_ru?: string;
          unit_number?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      mistake_events: {
        Row: {
          attempt_id: string;
          concept_key: string;
          created_at: string;
          error_type: string;
          exercise_id: string;
          id: string;
          module_id: string;
          primary_topic_id: string | null;
          user_id: string;
        };
        Insert: {
          attempt_id: string;
          concept_key: string;
          created_at?: string;
          error_type: string;
          exercise_id: string;
          id?: string;
          module_id: string;
          primary_topic_id?: string | null;
          user_id: string;
        };
        Update: {
          attempt_id?: string;
          concept_key?: string;
          created_at?: string;
          error_type?: string;
          exercise_id?: string;
          id?: string;
          module_id?: string;
          primary_topic_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mistake_events_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: true;
            referencedRelation: "attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mistake_events_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mistake_events_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mistake_events_primary_topic_id_fkey";
            columns: ["primary_topic_id"];
            isOneToOne: false;
            referencedRelation: "grammar_topics";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          preferred_language: string;
          timezone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          preferred_language?: string;
          timezone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          preferred_language?: string;
          timezone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reading_passages: {
        Row: {
          body_ko: string;
          content_version: string;
          created_at: string;
          id: string;
          logical_id: string;
          payload: Json;
          primary_module_id: string;
          status: Database["public"]["Enums"]["content_lifecycle_status"];
          title_ko: string;
          title_ru: string;
          translation_ru: string | null;
          updated_at: string;
        };
        Insert: {
          body_ko: string;
          content_version: string;
          created_at?: string;
          id?: string;
          logical_id: string;
          payload?: Json;
          primary_module_id: string;
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          title_ko: string;
          title_ru: string;
          translation_ru?: string | null;
          updated_at?: string;
        };
        Update: {
          body_ko?: string;
          content_version?: string;
          created_at?: string;
          id?: string;
          logical_id?: string;
          payload?: Json;
          primary_module_id?: string;
          status?: Database["public"]["Enums"]["content_lifecycle_status"];
          title_ko?: string;
          title_ru?: string;
          translation_ru?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_passages_primary_module_id_fkey";
            columns: ["primary_module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      review_queue: {
        Row: {
          concept_key: string;
          consecutive_correct: number;
          created_at: string;
          due_at: string | null;
          exercise_id: string | null;
          id: string;
          interval_stage: number;
          last_attempt_id: string | null;
          module_id: string;
          status: Database["public"]["Enums"]["review_queue_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          concept_key: string;
          consecutive_correct?: number;
          created_at?: string;
          due_at?: string | null;
          exercise_id?: string | null;
          id?: string;
          interval_stage?: number;
          last_attempt_id?: string | null;
          module_id: string;
          status?: Database["public"]["Enums"]["review_queue_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          concept_key?: string;
          consecutive_correct?: number;
          created_at?: string;
          due_at?: string | null;
          exercise_id?: string | null;
          id?: string;
          interval_stage?: number;
          last_attempt_id?: string | null;
          module_id?: string;
          status?: Database["public"]["Enums"]["review_queue_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_queue_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_queue_last_attempt_id_fkey";
            columns: ["last_attempt_id"];
            isOneToOne: false;
            referencedRelation: "attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_queue_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      session_exercises: {
        Row: {
          exercise_id: string;
          exercise_version: string;
          position: number;
          session_id: string;
          snapshot_payload: Json | null;
        };
        Insert: {
          exercise_id: string;
          exercise_version: string;
          position: number;
          session_id: string;
          snapshot_payload?: Json | null;
        };
        Update: {
          exercise_id?: string;
          exercise_version?: string;
          position?: number;
          session_id?: string;
          snapshot_payload?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "session_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_exercises_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "training_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      training_sessions: {
        Row: {
          complete_idempotency_key: string | null;
          completed_at: string | null;
          content_version: string;
          current_index: number;
          difficulty: Database["public"]["Enums"]["exercise_difficulty"] | null;
          id: string;
          idempotency_key: string;
          last_activity_at: string;
          mode: string;
          module_id: string;
          random_seed: string;
          started_at: string;
          status: Database["public"]["Enums"]["training_session_status"];
          user_id: string;
        };
        Insert: {
          complete_idempotency_key?: string | null;
          completed_at?: string | null;
          content_version: string;
          current_index?: number;
          difficulty?: Database["public"]["Enums"]["exercise_difficulty"] | null;
          id?: string;
          idempotency_key: string;
          last_activity_at?: string;
          mode: string;
          module_id: string;
          random_seed: string;
          started_at?: string;
          status?: Database["public"]["Enums"]["training_session_status"];
          user_id: string;
        };
        Update: {
          complete_idempotency_key?: string | null;
          completed_at?: string | null;
          content_version?: string;
          current_index?: number;
          difficulty?: Database["public"]["Enums"]["exercise_difficulty"] | null;
          id?: string;
          idempotency_key?: string;
          last_activity_at?: string;
          mode?: string;
          module_id?: string;
          random_seed?: string;
          started_at?: string;
          status?: Database["public"]["Enums"]["training_session_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "training_sessions_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      user_module_progress: {
        Row: {
          accuracy: number;
          attempts_count: number;
          completed_sessions: number;
          correct_count: number;
          last_practiced_at: string | null;
          mastery_status: Database["public"]["Enums"]["mastery_status"];
          module_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accuracy?: number;
          attempts_count?: number;
          completed_sessions?: number;
          correct_count?: number;
          last_practiced_at?: string | null;
          mastery_status?: Database["public"]["Enums"]["mastery_status"];
          module_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accuracy?: number;
          attempts_count?: number;
          completed_sessions?: number;
          correct_count?: number;
          last_practiced_at?: string | null;
          mastery_status?: Database["public"]["Enums"]["mastery_status"];
          module_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      user_skill_progress: {
        Row: {
          accuracy: number;
          attempts: number;
          correct: number;
          created_at: string;
          last_practiced_at: string | null;
          learning_skill: Database["public"]["Enums"]["learning_skill"];
          mastery: Database["public"]["Enums"]["mastery_status"];
          module_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accuracy?: number;
          attempts?: number;
          correct?: number;
          created_at?: string;
          last_practiced_at?: string | null;
          learning_skill: Database["public"]["Enums"]["learning_skill"];
          mastery?: Database["public"]["Enums"]["mastery_status"];
          module_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accuracy?: number;
          attempts?: number;
          correct?: number;
          created_at?: string;
          last_practiced_at?: string | null;
          learning_skill?: Database["public"]["Enums"]["learning_skill"];
          mastery?: Database["public"]["Enums"]["mastery_status"];
          module_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_skill_progress_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_skill_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_topic_progress: {
        Row: {
          accuracy: number;
          attempts_count: number;
          content_version: string;
          correct_count: number;
          last_practiced_at: string | null;
          mastery_status: Database["public"]["Enums"]["mastery_status"];
          topic_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accuracy?: number;
          attempts_count?: number;
          content_version: string;
          correct_count?: number;
          last_practiced_at?: string | null;
          mastery_status?: Database["public"]["Enums"]["mastery_status"];
          topic_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accuracy?: number;
          attempts_count?: number;
          content_version?: string;
          correct_count?: number;
          last_practiced_at?: string | null;
          mastery_status?: Database["public"]["Enums"]["mastery_status"];
          topic_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_topic_progress_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "grammar_topics";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      exercise_options_public: {
        Row: {
          exercise_id: string | null;
          explanation_ru: string | null;
          id: string | null;
          label_ko: string | null;
          label_ru: string | null;
          option_key: string | null;
          sort_order: number | null;
          value_payload: Json | null;
        };
        Insert: {
          exercise_id?: string | null;
          explanation_ru?: string | null;
          id?: string | null;
          label_ko?: string | null;
          label_ru?: string | null;
          option_key?: string | null;
          sort_order?: number | null;
          value_payload?: Json | null;
        };
        Update: {
          exercise_id?: string | null;
          explanation_ru?: string | null;
          id?: string | null;
          label_ko?: string | null;
          label_ru?: string | null;
          option_key?: string | null;
          sort_order?: number | null;
          value_payload?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_options_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      apply_review_queue_after_attempt: {
        Args: {
          p_attempt_id: string;
          p_concept_key: string;
          p_exercise_id: string;
          p_is_correct: boolean;
          p_module_id: string;
          p_now: string;
          p_session_mode: string;
          p_user_id: string;
        };
        Returns: undefined;
      };
      approved_exercise_exists_for_concept: {
        Args: { p_concept_key: string; p_module_id: string };
        Returns: boolean;
      };
      complete_training_session: {
        Args: {
          p_completed_at?: string;
          p_idempotency_key: string;
          p_session_id: string;
        };
        Returns: {
          complete_idempotency_key: string | null;
          completed_at: string | null;
          content_version: string;
          current_index: number;
          difficulty: Database["public"]["Enums"]["exercise_difficulty"] | null;
          id: string;
          idempotency_key: string;
          last_activity_at: string;
          mode: string;
          module_id: string;
          random_seed: string;
          started_at: string;
          status: Database["public"]["Enums"]["training_session_status"];
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "training_sessions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      compute_module_mastery_status: {
        Args: {
          p_module_attempts_count: number;
          p_module_id: string;
          p_user_id: string;
        };
        Returns: Database["public"]["Enums"]["mastery_status"];
      };
      compute_topic_mastery_status: {
        Args: { p_attempts_count: number; p_correct_count: number };
        Returns: Database["public"]["Enums"]["mastery_status"];
      };
      is_public_exercise: { Args: { p_exercise_id: string }; Returns: boolean };
      is_published_module: { Args: { p_module_id: string }; Returns: boolean };
      is_published_reading_passage: {
        Args: { p_passage_id: string };
        Returns: boolean;
      };
      is_published_topic: { Args: { p_topic_id: string }; Returns: boolean };
      is_semver: { Args: { "": string }; Returns: boolean };
      owns_training_session: {
        Args: { p_session_id: string };
        Returns: boolean;
      };
      rebuild_user_progress: { Args: { p_user_id: string }; Returns: undefined };
      refresh_user_progress_for_session: {
        Args: {
          p_completed_at: string;
          p_session_id: string;
          p_user_id: string;
        };
        Returns: undefined;
      };
      resolve_approved_exercises_for_concepts: {
        Args: { p_concept_keys: string[]; p_module_id: string };
        Returns: {
          concept_key: string;
          content_version: string;
          exercise_id: string;
        }[];
      };
      submit_training_attempt: {
        Args: {
          p_answer_version: string;
          p_duration_ms?: number;
          p_exercise_id: string;
          p_idempotency_key: string;
          p_is_correct: boolean;
          p_mistake_concept_key?: string;
          p_mistake_error_type?: string;
          p_mistake_module_id?: string;
          p_mistake_primary_topic_id?: string | null;
          p_normalized_answer: Json;
          p_now?: string;
          p_raw_answer: Json;
          p_reason_code: string;
          p_score: number;
          p_session_id: string;
        };
        Returns: {
          answer_version: string;
          answered_at: string;
          attempt_number: number;
          duration_ms: number | null;
          exercise_id: string;
          id: string;
          idempotency_key: string;
          is_correct: boolean;
          normalized_answer: Json;
          raw_answer: Json;
          reason_code: string;
          score: number;
          session_id: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      sync_review_queue_availability: {
        Args: { p_now?: string };
        Returns: {
          concept_key: string;
          consecutive_correct: number;
          created_at: string;
          due_at: string | null;
          exercise_id: string | null;
          id: string;
          interval_stage: number;
          last_attempt_id: string | null;
          module_id: string;
          status: Database["public"]["Enums"]["review_queue_status"];
          updated_at: string;
          user_id: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "review_queue";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
    };
    Enums: {
      accepted_answer_review_status: "pending" | "approved" | "rejected";
      ai_generation_status: "queued" | "running" | "succeeded" | "failed" | "timed_out";
      content_confidence: "high" | "medium" | "low";
      content_lifecycle_status: "draft" | "reviewed" | "published" | "archived";
      content_review_decision: "reviewed" | "approved" | "rejected";
      content_review_entity_type:
        | "learning_module"
        | "grammar_topic"
        | "dictionary_entry"
        | "honorific_pair"
        | "exercise"
        | "reading_passage"
        | "content_source";
      dictionary_module_role: "primary" | "secondary" | "review";
      exercise_dictionary_role: "target" | "distractor" | "context";
      exercise_difficulty: "easy" | "medium" | "hard";
      exercise_lifecycle_status: "draft" | "reviewed" | "approved" | "rejected" | "archived";
      exercise_source: "manual" | "ai";
      exercise_topic_role: "primary" | "secondary";
      exercise_type:
        | "free-response"
        | "meaning-choice"
        | "honorific-choice"
        | "plain-choice"
        | "matching-translation"
        | "matching-honorific"
        | "fill-blank"
        | "single-choice";
      generated_content_status: "generated" | "reviewed" | "approved" | "rejected" | "promoted";
      generated_validation_status: "pending" | "valid" | "invalid";
      honorific_relation_type: "exact" | "contextual";
      learning_skill: "grammar" | "vocabulary" | "reading";
      mastery_status: "not_started" | "learning" | "practiced";
      review_queue_status: "due" | "scheduled" | "mastered" | "suspended";
      training_session_status: "active" | "completed" | "abandoned";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      accepted_answer_review_status: ["pending", "approved", "rejected"],
      ai_generation_status: ["queued", "running", "succeeded", "failed", "timed_out"],
      content_confidence: ["high", "medium", "low"],
      content_lifecycle_status: ["draft", "reviewed", "published", "archived"],
      content_review_decision: ["reviewed", "approved", "rejected"],
      content_review_entity_type: [
        "learning_module",
        "grammar_topic",
        "dictionary_entry",
        "honorific_pair",
        "exercise",
        "reading_passage",
        "content_source",
      ],
      dictionary_module_role: ["primary", "secondary", "review"],
      exercise_dictionary_role: ["target", "distractor", "context"],
      exercise_difficulty: ["easy", "medium", "hard"],
      exercise_lifecycle_status: ["draft", "reviewed", "approved", "rejected", "archived"],
      exercise_source: ["manual", "ai"],
      exercise_topic_role: ["primary", "secondary"],
      exercise_type: [
        "free-response",
        "meaning-choice",
        "honorific-choice",
        "plain-choice",
        "matching-translation",
        "matching-honorific",
        "fill-blank",
        "single-choice",
      ],
      generated_content_status: ["generated", "reviewed", "approved", "rejected", "promoted"],
      generated_validation_status: ["pending", "valid", "invalid"],
      honorific_relation_type: ["exact", "contextual"],
      learning_skill: ["grammar", "vocabulary", "reading"],
      mastery_status: ["not_started", "learning", "practiced"],
      review_queue_status: ["due", "scheduled", "mastered", "suspended"],
      training_session_status: ["active", "completed", "abandoned"],
    },
  },
} as const;
